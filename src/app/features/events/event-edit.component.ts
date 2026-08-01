import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { MessageModule } from 'primeng/message';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputNumberModule } from 'primeng/inputnumber';
import { OptionSelectButtonComponent } from '@shared/components/option-select-button.component';
import { DatabaseService } from '@core/services/database.service';
import { EvenementService } from '@core/services/evenement.service';
import { configsTypeEvenemnt, ChoixDeJeuBrasCasse, ChoixDeJeuPenalite, ComplementDiscipline, EquipeCode, Evenement, FautesBrasCasse, FautesPenalite, Match, NatureEvenement, Periode, PositionLargeur, Resultat, ResultatMelee, ResultatMaul, ResultatRuck, ResultatTouche, Recuperation, TypeEvenement, ZoneLancee, ZoneTerrain, ConfigTypeEvenement, DEFAUT_TYPE_EVENEMENT } from '@core/models/datamodel';
import { MatchService } from '@core/services/match.service';
import { ButtonModule } from 'primeng/button';
import { EVENT_NATURE_OPTIONS, FAUTES_BRAS_CASSE_OPTIONS, FAUTES_PENALITE_OPTIONS, CHOIX_DE_JEU_PENALITE_OPTIONS, CHOIX_DE_JEU_BRAS_CASSE_OPTIONS, COMPLEMENT_DISCIPLINE_OPTIONS, Option, POSITION_LARGEUR_OPTIONS, RECUPERATION_OPTIONS, RESULTAT_OPTIONS, RESULTAT_MELEE_OPTIONS, RESULTAT_MAUL_OPTIONS, RESULTAT_RUCK_OPTIONS, RESULTAT_TOUCHE_OPTIONS, ZONE_TERRAIN_OPTIONS } from './event-edit.options';

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [
    ButtonModule,
    CommonModule, 
    CardModule, 
    MessageModule, 
    RadioButtonModule,
    InputNumberModule,
    OptionSelectButtonComponent,
    ReactiveFormsModule],
  templateUrl: './event-edit.component.html',
  styleUrl: './event-edit.component.css'
})
export class EventEditComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly db = inject(DatabaseService);
  private readonly evenementService = inject(EvenementService);
  private readonly matchService = inject(MatchService);
  private readonly fb = inject(FormBuilder);

  protected readonly eventNatureOptions: Option<NatureEvenement>[] = EVENT_NATURE_OPTIONS;
  protected readonly zoneTerrainOptions: Option<ZoneTerrain>[] = ZONE_TERRAIN_OPTIONS;
  protected readonly positionLargeurOptions: Option<PositionLargeur>[] = POSITION_LARGEUR_OPTIONS;
  protected readonly complementDisciplineOptions: Option<ComplementDiscipline>[] = COMPLEMENT_DISCIPLINE_OPTIONS;
  protected readonly fautesPenaliteOptions: Option<FautesPenalite>[] = FAUTES_PENALITE_OPTIONS;
  protected readonly fautesBrasCasseOptions: Option<FautesBrasCasse>[] = FAUTES_BRAS_CASSE_OPTIONS;
  protected readonly choixDeJeuPenaliteOptions: Option<ChoixDeJeuPenalite>[] = CHOIX_DE_JEU_PENALITE_OPTIONS;
  protected readonly choixDeJeuBrasCasseOptions: Option<ChoixDeJeuBrasCasse>[] = CHOIX_DE_JEU_BRAS_CASSE_OPTIONS;
  protected readonly resultatMeleeOptions: Option<ResultatMelee>[] = RESULTAT_MELEE_OPTIONS;
  protected readonly resultatMaulOptions: Option<ResultatMaul>[] = RESULTAT_MAUL_OPTIONS;
  protected readonly resultatRuckOptions: Option<ResultatRuck>[] = RESULTAT_RUCK_OPTIONS;
  protected readonly resultatToucheOptions: Option<ResultatTouche>[] = RESULTAT_TOUCHE_OPTIONS;
  protected readonly recuperationOptions: Option<Recuperation>[] = RECUPERATION_OPTIONS;
  protected readonly resultatOptions: Option<Resultat>[] = RESULTAT_OPTIONS;
  protected eventTypeOptions = signal<Option<TypeEvenement>[]>([]);

  protected match = signal<Match | undefined>(undefined);
  protected event = signal<Evenement | undefined>(undefined);
  protected config = computed(() => {
    const nature = this.event()?.nature;
    const type = this.event()?.type;
    return nature && type 
      ?  configsTypeEvenemnt.find((cfg) => cfg.nature === nature && cfg.type === type)
      : undefined;
  });
  protected readonly isEdit = signal(false);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly form = this.fb.group({
    periode: [1 as Periode],
    equipe: ['NOUS' as EquipeCode],
    nature: ['CONQUETE' as NatureEvenement, Validators.required],
    type: ['ESSAI' as TypeEvenement, Validators.required],
    zoneTerrain: [undefined as ZoneTerrain | undefined],
    positionLargeur: [undefined as PositionLargeur | undefined],
    complementDiscipline: [undefined as ComplementDiscipline | undefined],
    fautesPenalite: [undefined as FautesPenalite | undefined],
    fautesBrasCasse: [undefined as FautesBrasCasse | undefined],
    choixDeJeuPenalite: [undefined as ChoixDeJeuPenalite | undefined],
    choixDeJeuBrasCasse: [undefined as ChoixDeJeuBrasCasse | undefined],
    zoneLancee: [undefined as ZoneLancee | undefined],
    numeroJoueur1: [undefined as number | undefined],
    numeroJoueur2: [undefined as number | undefined],
    distanceJeuPied: [undefined as number | undefined],
    resultatMelee: [undefined as ResultatMelee | undefined],
    resultatMaul: [undefined as ResultatMaul | undefined],
    resultRuck: [undefined as ResultatRuck | undefined],
    resultatTouche: [undefined as ResultatTouche | undefined],
    recuperation: [undefined as Recuperation | undefined],
    resultat: [undefined as Resultat | undefined],
  });
  protected readonly requiredValidator = Validators.required;


  private besoinCalculerScore = false;

  async ngOnInit() {
    try {
      this.loading.set(true);
      this.event.set(await this.loadEvenement() || await this.createEvenement());
      if (!this.event()) {
        this.error.set('Erreur technique de création d’un événement');
        return;
      }

      this.match.set(await this.db.getMatch(this.event()!.matchId));
      if (!this.match()) {
        this.error.set('Impossible de créer un événement pour un match introuvable');
        return;
      }
      
      this.form.patchValue({
        periode: this.event()!.periode,
        equipe: this.event()!.equipe,
        nature: this.event()!.nature,
        type: this.event()!.type,
        zoneTerrain: this.event()!.zoneTerrain,
        positionLargeur: this.event()!.positionLargeur,
        complementDiscipline: this.event()!.complementDiscipline,
        fautesPenalite: this.event()!.fautesPenalite,
        fautesBrasCasse: this.event()!.fautesBrasCasse,
        choixDeJeuPenalite: this.event()!.choixDeJeuPenalite,
        choixDeJeuBrasCasse: this.event()!.choixDeJeuBrasCasse,
        resultatMelee: this.event()!.resultatMelee,
        resultatMaul: this.event()!.resultatMaul,
        resultRuck: this.event()!.resultRuck,
        resultatTouche: this.event()!.resultatTouche,
        recuperation: this.event()!.recuperation,
        resultat: this.event()!.resultat,
        zoneLancee: this.event()!.zoneLancee,
        numeroJoueur1: this.event()!.numeroJoueur1,
        numeroJoueur2: this.event()!.numeroJoueur2,
        distanceJeuPied: this.event()!.distanceJeuPied,
      });
      this.onNatureChange(this.event()!.nature);
      this.onTypeChange(this.event()!.type);
      this.updateValidators();
      

    } finally {
      this.loading.set(false);
      if (this.error()) {
        this.router.navigate(['/app/home']);
      }
    }
  }

  protected onPeriodeChange(periode: Periode): void {
    this.event.update(ev => ev ? { ...ev, periode } : undefined);
    // mise à jour du cache de la periode pour le prochain événement
    this.evenementService.periodeCourante = periode;
  }
  protected onNatureChange(nature: NatureEvenement): void {
    this.form.controls.nature.setValue(nature);
    this.event.update(ev => ev ? { ...ev, nature } : undefined);
    this.eventTypeOptions.set(this.getTypeOptions(nature));

    const typeDefaut = DEFAUT_TYPE_EVENEMENT.find(d => d.nature === nature)?.type;
    if (typeDefaut) this.onTypeChange(typeDefaut);
  }
  protected onTypeChange(type: TypeEvenement): void { 
    this.form.controls.type.setValue(type);
    this.event.update(ev => ev ? { ...ev, type } : undefined);
    if (this.config()?.resultat && !this.event()!.resultat) {
       this.form.patchValue({ resultat: 'REUSSITE' });
      this.event()!.resultat = 'REUSSITE';
    }
    if (this.config()?.equipe && !this.event()!.equipe) {
       this.form.patchValue({ equipe: 'NOUS' });
      this.event()!.equipe = 'NOUS';
    }
    if (this.config()?.complementDiscipline && !this.event()!.complementDiscipline) {
       this.form.patchValue({ complementDiscipline: 'AUCUN' });
      this.event()!.complementDiscipline = 'AUCUN';
    }
    this.updateValidators();
  }
  protected onEquipeChange(equipe: EquipeCode): void { this.event.update(ev => ev ? { ...ev, equipe } : undefined); }
  protected onZoneTerrainChange(zoneTerrain: ZoneTerrain): void { this.event.update(ev => ev ? { ...ev, zoneTerrain } : undefined);}
  protected onPositionLargeurChange(positionLargeur: PositionLargeur): void { this.event.update(ev => ev ? { ...ev, positionLargeur } : undefined);}
  protected onComplementDisciplineChange(complementDiscipline: ComplementDiscipline): void { this.event.update(ev => ev ? { ...ev, complementDiscipline } : undefined); }
  protected onFautesPenaliteChange(fautesPenalite: FautesPenalite): void { this.event.update(ev => ev ? { ...ev, fautesPenalite } : undefined); }
  protected onFautesBrasCasseChange(fautesBrasCasse: FautesBrasCasse): void { this.event.update(ev => ev ? { ...ev, fautesBrasCasse } : undefined); }
  protected onChoixDeJeuPenaliteChange(choixDeJeuPenalite: ChoixDeJeuPenalite): void { this.event.update(ev => ev ? { ...ev, choixDeJeuPenalite } : undefined); }
  protected onChoixDeJeuBrasCasseChange(choixDeJeuBrasCasse: ChoixDeJeuBrasCasse): void { this.event.update(ev => ev ? { ...ev, choixDeJeuBrasCasse } : undefined); }
  protected onResultatMeleeChange(resultatMelee: ResultatMelee): void { this.event.update(ev => ev ? { ...ev, resultatMelee } : undefined); }
  protected onResultatMaulChange(resultatMaul: ResultatMaul): void { this.event.update(ev => ev ? { ...ev, resultatMaul } : undefined); }
  protected onResultatRuckChange(resultRuck: ResultatRuck): void { this.event.update(ev => ev ? { ...ev, resultRuck } : undefined); }
  protected onResultatToucheChange(resultatTouche: ResultatTouche): void { this.event.update(ev => ev ? { ...ev, resultatTouche } : undefined); }
  protected onRecuperationChange(recuperation: Recuperation): void { this.event.update(ev => ev ? { ...ev, recuperation } : undefined); }
  protected onResultatChange(resultat: Resultat): void { this.event.update(ev => ev ? { ...ev, resultat } : undefined); }
  protected onZoneLanceChange(zoneLancee: ZoneLancee): void { this.event.update(ev => ev ? { ...ev, zoneLancee } : undefined); }
  protected onNumeroJoueur1Change(numeroJoueur1: number | null): void { this.event.update(ev => ev ? { ...ev, numeroJoueur1: numeroJoueur1 ?? undefined } : undefined); }
  protected onNumeroJoueur2Change(numeroJoueur2: number | null): void { this.event.update(ev => ev ? { ...ev, numeroJoueur2: numeroJoueur2 ?? undefined } : undefined); }
  protected onDistanceJeuPiedChange(distanceJeuPied: number | null): void { this.event.update(ev => ev ? { ...ev, distanceJeuPied: distanceJeuPied ?? undefined } : undefined); }

  public async persistEvent(createAnother: boolean): Promise<void> {
    const currentEvent = this.event();
    if (!currentEvent || this.saving()) return;

    this.updateValidators();
    if (this.form.controls.nature.invalid || this.form.controls.type.invalid || this.form.controls.equipe.invalid || !this.config()) {
      this.form.controls.nature.markAsTouched();
      this.form.controls.type.markAsTouched();
      this.form.controls.equipe.markAsTouched();
      this.error.set('La nature et le type de l événement sont obligatoires.');
      return;
    }
    if (this.form.invalid) {
      this.error.set('Vous n avez pas tout rempli.');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    try {
      const event: Evenement = { ...currentEvent };
      this.evenementService.nettoyerEvenement(event, this.config()!);

      if (this.isEdit()) {
        await this.db.updateEvent(event);
      } else {
        const { id: _id, ...eventToCreate } = event;
        const createdEvent = await this.db.addEvent(eventToCreate);
        this.event.set(createdEvent);
      }
      if (this.besoinCalculerScore || event.nature === 'SCORE') {
        await this.matchService.calculerScore(this.match()!.id);
      }
      await this.router.navigate(createAnother
        ? ['/app/match', event.matchId, 'event', 'new']
        : ['/app/match', event.matchId]);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Impossible de sauvegarder l’événement.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async delete(): Promise<void> {
    const currentEvent = this.event();
    if (!currentEvent?.id || !this.isEdit() || this.saving()) return;
    if (!confirm('Supprimer cet événement ?')) return;

    this.saving.set(true);
    try {
      await this.db.deleteEvent(currentEvent.id);
      if (this.besoinCalculerScore || currentEvent.nature === 'SCORE') {
        await this.matchService.calculerScore(this.match()!.id);
      }
      await this.router.navigate(['/app/match', currentEvent.matchId]);
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Impossible de supprimer l’événement.');
    } finally {
      this.saving.set(false);
    }
  }

  protected cancel(): void {
    const matchId = this.event()?.matchId;
    if (matchId) {
      this.router.navigate(['/app/match', matchId]);
    } else {
      this.router.navigate(['/app/home']);
    }
  }

  private async loadEvenement(): Promise<Evenement | undefined> {
    try {
      const eventId = this.route.snapshot.paramMap.get('eventId');
      if (!eventId) {
        return undefined;
      }

      this.event.set(await this.db.getEvent(+eventId));
      if (!this.event()) {
        this.error.set(`Événement introuvable : ${eventId}`);
        return undefined;
      }
      this.besoinCalculerScore = this.event()!.nature === 'SCORE';
      this.isEdit.set(true);
      return this.event();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Impossible de charger l’événement.');
      return undefined;
    }
  }

  private async createEvenement(): Promise<Evenement | undefined> {
    try {
      const matchId = this.route.snapshot.paramMap.get('matchId');
      if (!matchId) {
        this.error.set('Identifiant match manquant lors de la création d un événement.');
        return undefined;
      }

      this.event.set(this.evenementService.emptyEvenement());
      this.event.update((ev) => {
        ev!.matchId = +matchId;
        return ev;
      });
      this.isEdit.set(false);
      return this.event();
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Impossible de créer l événement.');
      return undefined;
    }
  }

  private updateValidators(): void {
    this.updateControl(this.form.controls.periode, this.config()?.periode);
    this.updateControl(this.form.controls.equipe, this.config()?.equipe);
    this.updateControl(this.form.controls.positionLargeur, this.config()?.positionLargeur);
    this.updateControl(this.form.controls.zoneTerrain, this.config()?.zoneTerrain);

    this.updateControl(this.form.controls.resultat, this.config()?.resultat);
    this.updateControl(this.form.controls.recuperation, this.config()?.recuperation);
    this.updateControl(this.form.controls.resultatMaul, this.config()?.resultatMaul);
    this.updateControl(this.form.controls.resultatMelee, this.config()?.resultatMelee);
    this.updateControl(this.form.controls.resultatTouche, this.config()?.resultatTouche);
    this.updateControl(this.form.controls.zoneLancee, this.config()?.zoneLancee);

    this.updateControl(this.form.controls.complementDiscipline, this.config()?.complementDiscipline);
    this.updateControl(this.form.controls.choixDeJeuPenalite, this.config()?.choixDeJeuPenalite);
    this.updateControl(this.form.controls.choixDeJeuBrasCasse, this.config()?.choixDeJeuBrasCasse);
    this.updateControl(this.form.controls.numeroJoueur1, this.event()?.nature === 'REMPLACEMENT');
    this.updateControl(this.form.controls.numeroJoueur2, this.event()?.nature === 'REMPLACEMENT');
  }

  private updateControl(control: FormControl, required: boolean = false) {
    if (required) {
      control.setValidators(Validators.required);
    } else {
      control.clearValidators();
    }
    control.updateValueAndValidity({ emitEvent: false });
  }

  private getTypeOptions(nature: NatureEvenement): Option<TypeEvenement>[] {
    return configsTypeEvenemnt
      .filter(cfg => cfg.nature === nature)
      .map(cfg => {
        return { label: cfg.label, value: cfg.type, icon: cfg.noIcon ? undefined : `/icons/event/${cfg.nature}_${cfg.type}.png`}
      });
  }
}

/* option definitions moved to event-edit.options.ts */
/*
  label: string;
  value: T; 
  icon?: string;
}

export const ZONE_TERRAIN_OPTIONS: Option<ZoneTerrain>[] = [
  { value: 'NOS_22', label: 'Rouge' },
  { value: 'NOS_22_50', label: 'Orange' },
  { value: 'LEUR_50_22', label: 'Bleu' },
  { value: 'LEUR_22', label: 'Vert' },
] as Option<ZoneTerrain>[];

export const POSITION_LARGEUR_OPTIONS: Option<PositionLargeur>[] = [
  { value: '5mGauche', label: '5m à gauche' },
  { value: '5_15mGauche', label: '5m/15m à gauche' },
  { value: 'Gauche', label: 'Gauche' },
  { value: 'Centre', label: 'Centre' },
  { value: 'Droite', label: 'Droite' },
  { value: '5_15mDroite', label: '5m/15m à droite' },
  { value: '5mDroite', label: '5m à droite' },
] as Option<PositionLargeur>[];

export const COMPLEMENT_DISCIPLINE_OPTIONS: Option<ComplementDiscipline>[] = [
  { value: 'AUCUN',         label: 'Aucun' },
  { value: 'CARTON_BLANC',  label: 'Carton blanc',  icon: '/icons/event/CARTON_BLANC.png' },
  { value: 'CARTON_JAUNE',  label: 'Carton jaune',  icon: '/icons/event/CARTON_JAUNE.png' },
  { value: 'CARTON_ORANGE', label: 'Carton orange', icon: '/icons/event/CARTON_ORANGE.png'},
  { value: 'CARTON_ROUGE',  label: 'Carton rouge',  icon: '/icons/event/CARTON_ROUGE.png' },
] as Option<ComplementDiscipline>[];

export const FAUTES_PENALITE_OPTIONS: Option<FautesPenalite>[] = [
  ['HORS_JEU', 'Hors-jeu'],
  ['PLAQUAGE_HAUT', 'Plaquage haut'],
  ['PLAQUAGE_DANGEREUX', 'Plaquage dangereux'],
  ['PLAQUAGE_SANS_BALLON', 'Plaquage sans ballon'],
  ['JOUEUR_PLAQUE_NE_LIBERE_PAS', 'Joueur plaqué ne libère pas'],
  ['PLAQUEUR_NE_RELACHE_PAS', 'Plaqueur ne relâche pas'],
  ['PLAQUEUR_NE_SORT_PAS', 'Plaqueur ne sort pas'],
  ['ENTREE_SUR_LE_COTE', 'Entrée sur le côté'],
  ['RUCK_RETENU_AU_SOL', 'Ruck retenu au sol'],
  ['RUCK_GRATTAGE_ILLEGAL', 'Ruck : grattage illégal'],
  ['RUCK_JEU_A_LA_MAIN', 'Ruck : jeu à la main'],
  ['RUCK_ENTREE_SUR_LE_COTE', 'Ruck : entrée sur le côté'],
  ['RUCK_DEBLAYAGE_DANGEREUX', 'Ruck : déblayage dangereux'],
  ['MAUL_EFFONDREMENT', 'Maul : effondrement'],
  ['MAUL_ENTREE_SUR_LE_COTE', 'Maul : entrée sur le côté'],
  ['MAUL_OBSTRUCTION', 'Maul : obstruction'],
  ['MAUL_JEU_ILLEGAL_DU_BALLON', 'Maul : jeu illégal du ballon'],
  ['MELEE_EFFONDREMENT', 'Mêlée : effondrement'],
  ['MELEE_POUSSEE_ANTICIPEE', 'Mêlée : poussée anticipée'],
  ['MELEE_TOURNEE_VOLONTAIREMENT', 'Mêlée : tournée volontairement'],
  ['MELEE_RELEVER_ADVERSAIRE', 'Mêlée : relever adversaire'],
  ['MELEE_INTRODUCTION_INCORRECTE', 'Mêlée : introduction incorrecte'],
  ['MELEE_PILIER_EN_TRAVERS', 'Mêlée : pilier en travers'],
  ['MELEE_PIED_ILLEGAL', 'Mêlée : pied illégal'],
  ['MELEE_OBSTRUCTION_DEMI', 'Mêlée : obstruction du demi'],
  ['TOUCHE_OBSTRUCTION', 'Touche : obstruction'],
  ['TOUCHE_LEVEE_ILLICITE', 'Touche : levée illicite'],
  ['TOUCHE_JOUEUR_JOUE_AVANT_RECEPTION', 'Touche : joueur joue avant réception'],
  ['TOUCHE_REDUCTION_ILLEGALE_ESPACE', 'Touche : réduction illégale de l espace'],
  ['OBSTRUCTION', 'Obstruction'],
  ['CHARGE_SANS_BALLON', 'Charge sans ballon'],
  ['PLAQUAGE_CATHEDRALE', 'Plaquage cathédrale'],
  ['JEU_BRUTAL', 'Jeu brutal'],
  ['CONTESTATION_ARBITRE', 'Contestation de l arbitre'],
  ['COMPORTEMENT_ANTISPORTIF', 'Comportement antisportif'],
  ['FAUTES_REPETEES', 'Fautes répétées'],
  ['ANTI_JEU', 'Anti-jeu'],
  ['RETARD_DE_JEU', 'Retard de jeu'],
  ['FAUTE_VOLONTAIRE_ANTI_ESSAI', 'Faute volontaire anti-essai'],
  ['EN_AVANT_VOLONTAIRE', 'En-avant volontaire'],
  ['EN_AVANT_REPRIS_DEVANT', 'En-avant repris devant'],
].map(([value, label]) => ({ value, label })) as Option<FautesPenalite>[];

export const FAUTES_BRAS_CASSE_OPTIONS: Option<FautesBrasCasse>[] = [
  ['RETARD_FORMATION_MELEE', 'Retard formation mêlée'],
  ['ENGAGEMENT_INCORRECT', 'Engagement incorrect'],
  ['POUSSEE_SUPERIEURE_A_1M50', 'Poussée supérieure à 1,50 m'],
  ['PIED_HORS_POSITION_MELEE', 'Pied hors position en mêlée'],
  ['RETARD_FORMATION_TOUCHE', 'Retard formation touche'],
  ['ECART_NON_RESPECTE_EN_TOUCHE', 'Écart non respecté en touche'],
  ['COUP_DENVOI_INCORRECT', "Coup d'envoi incorrect"],
  ['RENVOI_INCORRECT', 'Renvoi incorrect'],
  ['JOUER_AVANT_LE_COUP_DE_PIED_DE_MARQUE', 'Jouer avant le coup de pied de marque'],
  ['RETARD_EXCESSIF_REPRISE_JEU', 'Retard excessif à la reprise du jeu'],
  ['NON_RESPECT_DISTANCE_10M', 'Non-respect de la distance de 10m'],
].map(([value, label]) => ({ value, label })) as Option<FautesBrasCasse>[];

export const CHOIX_DE_JEU_PENALITE_OPTIONS: Option<ChoixDeJeuPenalite>[] = [
  { value: 'POTEAU', label: 'Poteau', icon:'/icons/event/POTEAU.png'},
  { value: 'TOUCHE', label: 'Touche', icon:'/icons/event/TOUCHE.png' },
  { value: 'MAIN', label: 'Main',     icon:'/icons/event/MAIN.png'},
  { value: 'MELEE', label: 'Mêlée',   icon:'/icons/event/MELEE.png' },
];

export const CHOIX_DE_JEU_BRAS_CASSE_OPTIONS: Option<ChoixDeJeuBrasCasse>[] = [
  { value: 'MAIN', label: 'Main', icon: '/icons/event/MAIN.png' },
  { value: 'MELEE', label: 'Mêlée', icon: '/icons/event/MELEE.png' },
  { value: 'TOUCHE', label: 'Touche', icon: '/icons/event/TOUCHE.png' },
];

export const RESULTAT_MELEE_OPTIONS: Option<ResultatMelee>[] = [
  ['GAGNEE', 'Dominante', '/icons/event/REUSSITE.png'], 
  ['SUBIE', 'Subie', '/icons/event/ECHEC.png'], 
  ['CONTRE', 'Contre', '/icons/event/ECHEC.png'],
  ['GAIN_PENALITE', 'Gain pénalité', '/icons/event/GAIN_PENALITE.png'], 
  ['PENALISEE', 'Pénalisée', '/icons/event/DISCIPLINE_PENALITE.png'],
  ['ESSAI', 'Essai', '/icons/event/SCORE_ESSAI.png']
  ].map(([value, label, icon]) => ({ value, label, icon })) as Option<ResultatMelee>[];

export const RESULTAT_MAUL_OPTIONS: Option<ResultatMaul>[] = [
  ['AVANCEE_FAIBLE', 'Avancée faible', '/icons/event/REUSSITE.png'],
  ['AVANCEE_FORTE', 'Avancée forte', '/icons/event/REUSSITE.png'],
  ['PENALISEE', 'Pénalisée', '/icons/event/DISCIPLINE_PENALITE.png'],
  ['GAIN_PENALITE', 'Gain pénalité', '/icons/event/GAIN_PENALITE.png'], 
  ['ESSAI', 'Essai', '/icons/event/SCORE_ESSAI.png']
  ].map(([value, label, icon]) => ({ value, label, icon })) as Option<ResultatMaul>[];

export const RESULTAT_RUCK_OPTIONS: Option<ResultatRuck>[] = [
  ['GAGNE', 'Gagné', '/icons/event/REUSSITE.png'],
  ['CONSERVE', 'Conservé', '/icons/event/REUSSITE.png'],
  ['PERDU', 'Perdu', '/icons/event/ECHEC.png'],
  ['GAIN_PENALITE', 'Gain pénalité', '/icons/event/GAIN_PENALITE.png']
  ].map(([value, label, icon]) => ({ value, label, icon })) as Option<ResultatRuck>[];

export const RESULTAT_TOUCHE_OPTIONS: Option<ResultatTouche>[] = [
  ['GAGNEE', 'Gagnée', '/icons/event/REUSSITE.png'], 
  ['PERDUE', 'Perdue', '/icons/event/ECHEC.png'], 
  ['PENALISEE', 'Pénalisée', '/icons/event/DISCIPLINE_PENALITE.png'], 
  ['GAIN_PENALITE', 'Gain pénalité', '/icons/event/GAIN_PENALITE.png'],
  ['BRAS_CASSE', 'Bras cassé', '/icons/event/DISCIPLINE_BRAS_CASSE.png'],
  ['GAIN_BRAS_CASSE', 'Gain Bras cassé', '/icons/event/GAIN_BRAS_CASSE.png']
  ].map(([value, label, icon]) => ({ value, label, icon })) as Option<ResultatTouche>[];

export const RECUPERATION_OPTIONS: Option<Recuperation>[] = [
  ['GAGNE', 'Gagné', '/icons/event/REUSSITE.png'],
  ['PERDU', 'Perdu', '/icons/event/ECHEC.png']
  ].map(([value, label, icon]) => ({ value, label, icon })) as Option<Recuperation>[];

export const RESULTAT_OPTIONS: Option<Resultat>[] = [
  ['REUSSITE', 'Réussite', '/icons/event/REUSSITE.png'], 
  ['ECHEC', 'Échec', '/icons/event/ECHEC.png']
  ].map(([value, label, icon]) => ({ value, label, icon })) as Option<Resultat>[];

export const EVENT_NATURE_OPTIONS : Option<NatureEvenement>[] = [
  { nature: 'TEMPS',        label: 'Temps'          },
  { nature: 'SCORE',        label: 'Score'          },
  { nature: 'CONQUETE',     label: 'Conquête'       },
  { nature: 'FAIT_DE_JEU',  label: 'Fait de jeu'    },
  { nature: 'ERREUR',       label: 'Erreur'         },
  { nature: 'DISCIPLINE',   label: 'Discipline'     },
  { nature: 'REMPLACEMENT', label: 'Rempl'   }
  ].map(nat => { 
    return { 
      label: nat.label,  
      value: nat.nature as NatureEvenement,  
      icon: `/icons/event/${nat.nature}.png` 
    } as Option<NatureEvenement>; 
  });
*/
