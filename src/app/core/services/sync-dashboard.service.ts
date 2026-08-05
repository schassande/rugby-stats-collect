import { Injectable, inject } from '@angular/core';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { DatabaseService } from './database.service';
import { SyncService } from './sync.service';
import { AuthService } from './auth.service';
import { db as firestore } from '../config/firebase.config';
import { Equipe, Evenement, Match, SyncAction } from '../models/datamodel';

export type DashboardAction = 'send' | 'retry' | 'download' | 'delete' | 'conflict' | 'blocked';
export interface SyncDashboardRow {
  match: Match;
  local: Match | undefined;
  remote: Match | undefined;
  localEvents: Evenement[];
  remoteEvents: Evenement[];
  actions: SyncAction[];
  availableAction: DashboardAction;
  conflict?: string;
}

@Injectable({ providedIn: 'root' })
export class SyncDashboardService {
  private readonly database = inject(DatabaseService);
  private readonly sync = inject(SyncService);
  private readonly auth = inject(AuthService);

  /** Normalise récursivement une valeur en triant les propriétés des objets. */
  private normalizeForComparison(value: unknown): unknown {
    if (Array.isArray(value)) return value.map((item) => this.normalizeForComparison(item));
    if (value && typeof value === 'object') {
      return Object.keys(value as object)
        .sort()
        .reduce(
          (result, key) => {
            const item = (value as Record<string, unknown>)[key];
            if (item !== undefined) result[key] = this.normalizeForComparison(item);
            return result;
          },
          {} as Record<string, unknown>,
        );
    }
    return value;
  }

  /** Retourne les équipes locales gérées par l'utilisateur connecté. */
  async teams(): Promise<Equipe[]> {
    return this.database.getTeamsByManager(this.auth.getCurrentManager()?.id ?? '');
  }

  /** Télécharge les équipes distantes gérées par l'utilisateur, sans remplacer les équipes locales. */
  async downloadTeams(): Promise<void> {
    await this.sync.chargerMesEquipes();
  }

  /** Charge les matches distants d'une équipe avec les filtres Firestore requis par les règles de sécurité. */
  async remoteMatches(teamId: string): Promise<Match[]> {
    const managerId = this.auth.getCurrentManager()?.id;
    if (!managerId) return [];
    const snap = await getDocs(
      query(
        collection(firestore!, 'Match'),
        where('equipeId', '==', teamId),
        where('managerId', '==', managerId),
      ),
    );
    return snap.docs.map((d) => d.data() as Match);
  }

  /** Charge en une seule requête tous les événements distants d'un match. */
  async remoteEvents(matchId: string): Promise<Evenement[]> {
    const snap = await getDocs(
      query(collection(firestore!, 'Evenement'), where('matchId', '==', matchId)),
    );
    return snap.docs.map((d) => d.data() as Evenement);
  }

  /**
   * Construit les lignes du tableau pour une équipe.
   *
   * La méthode charge en parallèle les matches locaux, les matches distants et les actions de
   * synchronisation, puis forme l'union des matches par `match.id`. Pour chaque match de cette
   * union, elle charge les événements locaux et distants par match (jamais par événement),
   * rapproche les actions des événements locaux concernés et calcule l'action affichable selon
   * les priorités suivantes : conflit, téléchargement, action de synchronisation active, puis
   * suppression locale. Les données locales ne sont jamais remplacées par les données distantes.
   *
   * @param teamId Identifiant de l'équipe sélectionnée.
   * @returns Les lignes fusionnées, triées par date de match.
   */
  async load(teamId: string): Promise<SyncDashboardRow[]> {
    // Chargement parallele des sources independantes du tableau.
    const [locals, remotes, syncs] = await Promise.all([
      this.database.getMatchesByTeam(teamId),
      this.remoteMatches(teamId),
      this.database.getSyncs(undefined),
    ]);
    // L'identifiant du match est la cle exclusive de fusion local/serveur.
    const ids = new Set([...locals, ...remotes].map((m) => m.id));
    const rows: SyncDashboardRow[] = [];
    for (const id of ids) {
      // Le match peut exister localement, sur le serveur, ou des deux cotes.
      const local = locals.find((m) => m.id === id),
        remote = remotes.find((m) => m.id === id);

      // Une requete par match recupere tous ses evenements distants.
      const [localEvents, remoteEvents] = await Promise.all([
        local ? this.database.getEventsByMatch(id) : Promise.resolve([]),
        remote ? this.remoteEvents(id) : Promise.resolve([]),
      ]);

      // Les actions d'evenements sont limitees aux enfants de ce match.
      const actions = syncs.filter(
        (s) =>
          (s.objectType === 'Match' && s.objectId === id) ||
          (s.objectType === 'Evenement' && localEvents.some((e) => e.id === s.objectId)),
      );
      const active = actions.filter((s) => s.status !== 'synced');

      // Une divergence entre les deux versions est signalee comme conflit.
      const mismatch =
        local &&
        remote &&
        JSON.stringify(this.normalizeForComparison({ ...local, updatedAt: undefined })) !==
          JSON.stringify(this.normalizeForComparison({ ...remote, updatedAt: undefined }));

      let availableAction: DashboardAction = 'conflict',
        conflict: string | undefined;

      // Les branches suivantes appliquent les priorites fonctionnelles des actions.
      if (mismatch) {
        conflict = 'Conflit : les données locales et distantes diffèrent.';
      } else if (!local && remote) {
        availableAction = 'download';
      } else if (active.length) {
        const status =
          active.find((s) => s.status === 'conflict')?.status ??
          active.find((s) => s.status === 'failed')?.status ??
          active[0].status;
        availableAction = status === 'pending' ? 'send' 
          : status === 'failed' ? 'retry'
              : status === 'syncing' ? 'blocked' : 'conflict';
        if (availableAction === 'conflict') {
          conflict = 'Conflit de synchronisation à résoudre.';
        }
      } else if (local) availableAction = 'delete';
      rows.push({
        match: local ?? remote!,
        local,
        remote,
        localEvents,
        remoteEvents,
        actions,
        availableAction,
        conflict,
      });
    }

    // Tri final anti chronologique pour garantir un affichage stable 
    // et montrer les derniers matches en premier
    return rows.sort((a, b) => b.match.date.localeCompare(a.match.date));
  }

  /** Envoie uniquement les actions `pending` rattachées aux matches ou événements de l'équipe. */
  async sendPending(teamId: string): Promise<void> {
    const matches = await this.database.getMatchesByTeam(teamId),
      ids = new Set(matches.map((m) => m.id));
    const events = (
      await Promise.all(matches.map((m) => this.database.getEventsByMatch(m.id)))
    ).flat();
    const syncs = (await this.database.getPendingSyncs()).filter(
      (s) =>
        (s.objectType === 'Match' && ids.has(s.objectId)) ||
        (s.objectType === 'Evenement' && events.some((e) => e.id === s.objectId)),
    );
    await Promise.all(this.sync.sortSyncs(syncs).map((s) => this.sync.upload(s)));
  }

  /** Relance l'envoi de l'action existante, sans créer de nouvelle action. */
  async retry(action: SyncAction) {
    await this.sync.upload(action);
  }

  /** Supprime localement un match et ses événements sans générer de suppression distante. */
  async deleteLocal(row: SyncDashboardRow) {
    await this.database.deleteMatch(row.match.id, { localOnly: true });
  }

  /** Télécharge un match distant et ajoute uniquement les événements absents localement. */
  async download(row: SyncDashboardRow) {
    if (!row.local) await this.database.importMatches([row.remote!]);
    const localIds = new Set(row.localEvents.map((e) => e.id));
    await this.database.importEvents(row.remoteEvents.filter((e) => !localIds.has(e.id)));
  }
}
