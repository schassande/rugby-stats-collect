import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { Equipe, Evenement, Match } from '../models/datamodel';

export interface ExportResult {
  fileName: string;
  matchCount: number;
  eventCount: number;
}

@Injectable({ providedIn: 'root' })
export class ExportExcelService {
  /** Génère et télécharge un classeur Excel pour les matchs et événements fournis. */
  export(matches: Match[], events: Evenement[], team: Equipe): ExportResult {
    const selectedMatches = [...matches].sort(
      (a, b) => this.dateValue(b.date) - this.dateValue(a.date) || a.id.localeCompare(b.id),
    );
    const matchIds = new Set(selectedMatches.map((match) => match.id));
    const selectedEvents = events.filter((event) => matchIds.has(event.matchId));
    const orderedEvents = this.sortEvents(selectedEvents, selectedMatches);
    const eventCountByMatch = this.countEventsByMatch(orderedEvents);

    const workbook = XLSX.utils.book_new();
    this.addSheet(workbook, 'Matchs', this.createMatchRows(selectedMatches, team, eventCountByMatch));
    this.addSheet(workbook, 'Evenements', this.createEventRows(orderedEvents, selectedMatches));

    const fileName = `rugby-stats-${this.filePart(team.nom || 'equipe-inconnue')}-${this.filePart(
      selectedMatches[0]?.saison || 'saison-inconnue',
    )}-${this.timestamp()}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    return { fileName, matchCount: selectedMatches.length, eventCount: orderedEvents.length };
  }

  /** Construit les lignes de la feuille des matchs. */
  private createMatchRows(
    matches: Match[],
    team: Equipe,
    eventCountByMatch: Map<string, number>,
  ): Record<string, unknown>[] {
    return matches.map((match) => ({
      'Identifiant du match': match.id,
      Date: this.date(match.date),
      Saison: match.saison,
      Équipe: team.nom,
      Adversaire: match.nomAdversaire,
      Lieu: match.lieu || '',
      Terrain: match.terrain || '',
      'Conditions météo': match.conditions?.join(', ') || '',
      Début: this.date(match.temps?.debutMatch),
      Fin: this.date(match.temps?.finMatch),
      'Score nous': this.number(match.score?.nous),
      'Score adversaire': this.number(match.score?.adversaire),
      Statut: (match as Match & { status?: string }).status || '',
      'Nombre d’événements': eventCountByMatch.get(match.id) || 0,
    }));
  }

  /** Construit une ligne contenant tous les attributs exportables d’un événement. */
  private createEventRows(events: Evenement[], matches: Match[]): Record<string, unknown>[] {
    const matchesById = new Map(matches.map((match) => [match.id, match]));

    return events.map((event) => {
      const match = matchesById.get(event.matchId)!;
      return {
        'Identifiant de l’événement': event.id,
        'Identifiant du match': event.matchId,
        'Date du match': this.date(match.date),
        Adversaire: match.nomAdversaire,
        Période: event.periode,
        Instant: this.date(event.instant),
        Minute: this.number(event.minute),
        Seconde: this.number(event.seconde),
        Équipe: event.equipe || '',
        Nature: event.nature,
        Type: event.type,
        'Identifiant du rapporteur': event.rapporteurId,
        'Complément discipline': event.complementDiscipline || '',
        'Faute pénalité': event.fautesPenalite || '',
        'Faute bras cassé': event.fautesBrasCasse || '',
        Commentaire: event.commentaire || '',
        'Numéro joueur 1': this.number(event.numeroJoueur1),
        'Numéro joueur 2': this.number(event.numeroJoueur2),
        'Zone lancée': this.number(event.zoneLancee),
        'Zone terrain': event.zoneTerrain || '',
        'Position largeur': event.positionLargeur || '',
        'Choix de jeu pénalité': event.choixDeJeuPenalite || '',
        'Choix de jeu bras cassé': event.choixDeJeuBrasCasse || '',
        'Distance jeu au pied': this.number(event.distanceJeuPied),
        'Résultat mêlée': event.resultatMelee || '',
        'Résultat maul': event.resultatMaul || '',
        'Résultat touche': event.resultatTouche || '',
        'Résultat transformation': event.resultatTransformation || '',
        'Résultat ruck': event.resultRuck || '',
        Récupération: event.recuperation || '',
        Résultat: event.resultat || '',
      };
    });
  }

  /** Trie les événements par match, période et instant, en conservant l’ordre local si nécessaire. */
  private sortEvents(events: Evenement[], matches: Match[]): Evenement[] {
    const matchOrder = new Map(matches.map((match, index) => [match.id, index]));
    return events
      .map((event, index) => ({ event, index }))
      .sort(
        (a, b) =>
          matchOrder.get(a.event.matchId)! - matchOrder.get(b.event.matchId)! ||
          a.event.periode - b.event.periode ||
          this.optionalDateCompare(a.event.instant, b.event.instant, a.index, b.index),
      )
      .map(({ event }) => event);
  }

  /** Compte les événements rattachés à chaque match. */
  private countEventsByMatch(events: Evenement[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const event of events) counts.set(event.matchId, (counts.get(event.matchId) || 0) + 1);
    return counts;
  }

  /** Ajoute une feuille avec filtres, volets figés et largeur de colonnes. */
  private addSheet(workbook: XLSX.WorkBook, name: string, rows: Record<string, unknown>[]): void {
    const headers = Object.keys(rows[0] || {});
    const worksheet = XLSX.utils.json_to_sheet(rows);
    headers.forEach((header, index) => {
      if (['Date', 'Date du match'].includes(header)) this.formatColumn(worksheet, index, 'yyyy/mm/dd');
      if (['Début', 'Fin', 'Instant'].includes(header)) {
        this.formatColumn(worksheet, index, 'yyyy/mm/dd hh:mm:ss');
      }
    });
    worksheet['!autofilter'] = { ref: worksheet['!ref'] || 'A1' };
    worksheet['!freeze'] = { xSplit: 0, ySplit: 1 };
    worksheet['!cols'] = headers.map((header) => ({ wch: Math.min(45, Math.max(12, header.length + 2)) }));
    XLSX.utils.book_append_sheet(workbook, worksheet, name);
  }

  /** Applique un format Excel aux cellules de la colonne indiquée. */
  private formatColumn(worksheet: XLSX.WorkSheet, column: number, format: string): void {
    for (let row = 2; ; row++) {
      const cell = worksheet[XLSX.utils.encode_cell({ r: row - 1, c: column })];
      if (!cell) break;
      if (cell.v instanceof Date) cell.z = format;
    }
  }

  /** Convertit une date ISO en valeur date Excel, ou retourne une cellule vide. */
  private date(value: string | undefined): Date | '' {
    if (!value) return '';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date;
  }

  /** Retourne la valeur numérique ou une cellule vide. */
  private number(value: number | undefined): number | '' {
    return value ?? '';
  }

  /** Retourne la valeur temporelle utilisée pour le tri des matchs. */
  private dateValue(value: string): number {
    const timestamp = Date.parse(value);
    return Number.isNaN(timestamp) ? 0 : timestamp;
  }

  /** Compare deux instants en conservant l’ordre de lecture pour les dates invalides. */
  private optionalDateCompare(a: string, b: string, indexA: number, indexB: number): number {
    const dateA = Date.parse(a);
    const dateB = Date.parse(b);
    return Number.isNaN(dateA) || Number.isNaN(dateB) ? indexA - indexB : dateA - dateB;
  }

  /** Nettoie une valeur pour l’utiliser dans un nom de fichier. */
  private filePart(value: string): string {
    return value.replace(/[<>:"/\\|?*\x00-\x1F]/g, '-').replace(/[. ]+$/g, '').trim() || 'inconnu';
  }

  /** Produit l’horodatage local utilisé dans le nom du fichier. */
  private timestamp(): string {
    const date = new Date();
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}-${pad(
      date.getHours(),
    )}-${pad(date.getMinutes())}-${pad(date.getSeconds())}`;
  }
}
