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
import { configsTypeEvenemnt, ChoixDeJeuBrasCasse, ChoixDeJeuPenalite, ComplementDiscipline, EquipeCode, Evenement, FautesBrasCasse, FautesPenalite, Match, NatureEvenement, Periode, PositionLargeur, Resultat, ResultatMelee, ResultatMaul, ResultatRuck, ResultatTouche, Recuperation, TypeEvenement, ZoneLancee, ZoneTerrain, ConfigTypeEvenement, DEFAUT_TYPE_EVENEMENT, ResultatTransformation } from '@core/models/datamodel';
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
    resultatTransformation: [undefined as ResultatTransformation | undefined],
    recuperation: [undefined as Recuperation | undefined],
    resultat: [undefined as Resultat | undefined],
  });
  protected readonly requiredValidator = Validators.required;


  private besoinCalculerScore = false;

  async ngOnInit() {
    try {
      this.loading.set(true);
      this.event.set(await this.loadEvenement() || await this.createEvenement());
      if (!this.event() || !this.match()) {
        this.error.set('Erreur technique de création d un événement');
        return;
      }

      this.matchService.setCurrentMatch(this.match())

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
        resultatTransformation: this.event()!.resultatTransformation,
        recuperation: this.event()!.recuperation,
        resultat: this.event()!.resultat,
        zoneLancee: this.event()!.zoneLancee,
        numeroJoueur1: this.event()!.numeroJoueur1,
        numeroJoueur2: this.event()!.numeroJoueur2,
        distanceJeuPied: this.event()!.distanceJeuPied,
      });
      this.onNatureChange(this.event()!.nature, false);
      this.onTypeChange(this.event()!.type);
      this.updateValidators();
      

    } finally {
      this.loading.set(false);
      if (this.error()) {
        console.error(this.error());
        this.router.navigate(['/app/home']);
      }
    }
  }

  protected onPeriodeChange(periode: Periode): void {
    this.event.update(ev => ev ? { ...ev, periode } : undefined);
    // mise à jour du cache de la periode pour le prochain événement
    this.evenementService.periodeCourante = periode;
  }
  protected onNatureChange(nature: NatureEvenement, userChange = true): void {
    this.form.controls.nature.setValue(nature);
      this.event.update(ev => ev ? { ...ev, nature } : undefined);
    this.eventTypeOptions.set(this.getTypeOptions(nature));
    if (userChange) {
      const typeDefaut = DEFAUT_TYPE_EVENEMENT.find(d => d.nature === nature)?.type;
      if (typeDefaut) this.onTypeChange(typeDefaut, userChange);
    }
  }
  protected onTypeChange(type: TypeEvenement, userChange = true): void { 
    this.form.controls.type.setValue(type);
    this.event.update(ev => ev ? { ...ev, type } : undefined);
    if (this.config()?.resultat && !this.event()!.resultat) { 
      // Ajout d'une valeur par defaut
       this.form.patchValue({ resultat: 'REUSSITE' });
      this.event()!.resultat = 'REUSSITE';
    }
    if (this.config()?.equipe && !this.event()!.equipe) {
      // Ajout d'une valeur par defaut
       this.form.patchValue({ equipe: 'NOUS' });
     this.event()!.equipe = 'NOUS';
    }
    if (this.config()?.complementDiscipline && !this.event()!.complementDiscipline) {
      // Ajout d'une valeur par defaut
      this.form.patchValue({ complementDiscipline: 'AUCUN' });
      this.event()!.complementDiscipline = 'AUCUN';
    }
    // Lors d'un essai le resultat de la transformation doit être demandé
    this.config()!.resultatTransformation = this.event()!.type === 'ESSAI';

    this.updateValidators();
  }
  protected onEquipeChange(equipe: EquipeCode): void { 
    this.event.update(ev => ev ? { ...ev, equipe } : undefined); 
    this.form.controls.equipe.setValue(equipe, { emitEvent : false});
  }
  protected onZoneTerrainChange(zoneTerrain: ZoneTerrain): void { 
    this.event.update(ev => ev ? { ...ev, zoneTerrain } : undefined);
    this.form.controls.zoneTerrain.setValue(zoneTerrain, { emitEvent : false});
  }
  protected onPositionLargeurChange(positionLargeur: PositionLargeur): void { 
    this.event.update(ev => ev ? { ...ev, positionLargeur } : undefined);
    this.form.controls.positionLargeur.setValue(positionLargeur, { emitEvent : false});
  }
  protected onComplementDisciplineChange(complementDiscipline: ComplementDiscipline): void { 
    this.event.update(ev => ev ? { ...ev, complementDiscipline } : undefined); 
    this.form.controls.complementDiscipline.setValue(complementDiscipline, { emitEvent : false});
  }
  protected onFautesPenaliteChange(fautesPenalite: FautesPenalite): void { 
    this.event.update(ev => ev ? { ...ev, fautesPenalite } : undefined); 
    this.form.controls.fautesPenalite.setValue(fautesPenalite, { emitEvent : false});
  }
  protected onFautesBrasCasseChange(fautesBrasCasse: FautesBrasCasse): void { 
    this.event.update(ev => ev ? { ...ev, fautesBrasCasse } : undefined); 
    this.form.controls.fautesBrasCasse.setValue(fautesBrasCasse, { emitEvent : false});
  }
  protected onChoixDeJeuPenaliteChange(choixDeJeuPenalite: ChoixDeJeuPenalite): void { 
    this.event.update(ev => ev ? { ...ev, choixDeJeuPenalite } : undefined); 
    this.form.controls.choixDeJeuPenalite.setValue(choixDeJeuPenalite, { emitEvent : false});
  }
  protected onChoixDeJeuBrasCasseChange(choixDeJeuBrasCasse: ChoixDeJeuBrasCasse): void { 
    this.event.update(ev => ev ? { ...ev, choixDeJeuBrasCasse } : undefined); 
    this.form.controls.choixDeJeuBrasCasse.setValue(choixDeJeuBrasCasse, { emitEvent : false});
  }
  protected onResultatMeleeChange(resultatMelee: ResultatMelee): void { 
    this.event.update(ev => ev ? { ...ev, resultatMelee } : undefined); 
    this.form.controls.resultatMelee.setValue(resultatMelee, { emitEvent : false});
    console.log(this.event(), this.form.controls);
  }
  protected onResultatMaulChange(resultatMaul: ResultatMaul): void { 
    this.event.update(ev => ev ? { ...ev, resultatMaul } : undefined); 
    this.form.controls.resultatMaul.setValue(resultatMaul, { emitEvent : false});
  }
  protected onResultatRuckChange(resultRuck: ResultatRuck): void { 
    this.event.update(ev => ev ? { ...ev, resultRuck } : undefined); 
    this.form.controls.resultRuck.setValue(resultRuck, { emitEvent : false});
  }
  protected onResultatToucheChange(resultatTouche: ResultatTouche): void { 
    this.event.update(ev => ev ? { ...ev, resultatTouche } : undefined);
    this.form.controls.resultatTouche.setValue(resultatTouche, { emitEvent : false});
  }
  protected onResultatTransformationChange(resultatTransformation: Resultat): void { 
    this.event.update(ev => ev ? { ...ev, resultatTransformation } : undefined);
    this.form.controls.resultatTransformation.setValue(resultatTransformation, { emitEvent : false});
  }

  protected onRecuperationChange(recuperation: Recuperation): void { 
    this.event.update(ev => ev ? { ...ev, recuperation } : undefined); 
    this.form.controls.recuperation.setValue(recuperation, { emitEvent : false});
  }
  protected onResultatChange(resultat: Resultat): void { 
    this.event.update(ev => ev ? { ...ev, resultat } : undefined); 
    this.form.controls.resultat.setValue(resultat, { emitEvent : false});
  }
  protected onZoneLanceChange(zoneLancee: ZoneLancee): void { 
    this.event.update(ev => ev ? { ...ev, zoneLancee } : undefined); 
    this.form.controls.zoneLancee.setValue(zoneLancee, { emitEvent : false});
  }
  protected onNumeroJoueur1Change(numeroJoueur1: number | null): void { 
    this.event.update(ev => ev ? { ...ev, numeroJoueur1: numeroJoueur1 ?? 0 } : undefined); 
    this.form.controls.numeroJoueur1.setValue(numeroJoueur1, { emitEvent : false});
  }
  protected onNumeroJoueur2Change(numeroJoueur2: number | null): void { 
    this.event.update(ev => ev ? { ...ev, numeroJoueur2: numeroJoueur2 ?? 0 } : undefined); 
    this.form.controls.numeroJoueur2.setValue(numeroJoueur2, { emitEvent : false});
  }
  protected onDistanceJeuPiedChange(distanceJeuPied: number | null): void { 
    this.event.update(ev => ev ? { ...ev, distanceJeuPied: distanceJeuPied ?? 0 } : undefined); 
    this.form.controls.distanceJeuPied.setValue(distanceJeuPied, { emitEvent : false});
  }

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

      if (this.besoinCalculerScore || event.nature === 'SCORE' || event.type === 'PENALITE') {
        const m:Match = this.match()!;
        await this.matchService.calculerScore(m.id);
        this.match.update(() => { return { ...m}; })
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

      this.event.set(await this.db.getEvent(eventId));
      if (!this.event()) {
        this.error.set(`Événement introuvable : ${eventId}`);
        return undefined;
      }
      this.match.set(await this.db.getMatch(this.event()!.matchId));
      if (!this.match()) {
        this.error.set('Impossible de créer un événement pour un match introuvable');
        return undefined;
      }      
      this.besoinCalculerScore = this.event()!.nature === 'SCORE';
      this.isEdit.set(true);
      console.log(this.event())
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
        console.error('Identifiant match manquant lors de la création d un événement.')
        this.error.set('Identifiant match manquant lors de la création d un événement.');
        return undefined;
      }
      this.match.set(await this.db.getMatch(matchId));
      if (!this.match()) {
        console.error('Impossible de créer un événement pour un match introuvable: ', +matchId);
        this.error.set('Impossible de créer un événement pour un match introuvable');
        return;
      }      

      this.event.update(() => {
        console.debug('Creation d un evenement vide');
        const ev = this.evenementService.emptyEvenement()
        ev!.matchId = matchId;
        ev.periode = this.match()?.temps?.debut2iemeMiTemps ? 2 : 1;
        this.evenementService.calculerEvenementHeureMinute(ev!, this.match()!)
        return ev;
      });
      this.isEdit.set(false);
      return this.event();
    } catch (e) {
      console.log('Erreur lors de la creation de l evenemnt', e);
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
    this.updateControl(this.form.controls.resultatTransformation, this.config()?.resultatTransformation);
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
