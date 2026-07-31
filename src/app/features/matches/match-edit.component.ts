import { Component, OnInit, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import {
  ConditionMeteo,
  ConditionsMeteo,
  Equipe,
  Match,
  Saison,
  Saisons,
  TerrainType,
  TerrainTypes,
} from '@core/models/datamodel';
import { AuthService } from '@core/services/auth.service';
import { DatabaseService } from '@core/services/database.service';
import { MatchService } from '@core/services/match.service';
import { TeamService } from '@core/services/team.service';

@Component({
  selector: 'app-match-edit',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    DatePickerModule,
    InputNumberModule,
    InputTextModule,
    MessageModule,
    RadioButtonModule,
    SelectModule,
  ],
  template: `
    <p-card [header]="isEdit() ? 'Modifier le match' : 'Créer un match'" styleClass="match-card">
      @if (error()) {
        <p-message severity="error" [text]="error()!" />
      }

      <form [formGroup]="form" (ngSubmit)="save()" class="match-form">
        <div class="form-field">
          <label for="saison">Saison *</label>
          <p-select inputId="saison" formControlName="saison" [options]="seasons" />
        </div>
        <div class="form-field wide">
          <label for="adversaire">Adversaire *</label>
          <input id="adversaire" pInputText formControlName="nomAdversaire" placeholder="Nom de l'équipe adverse" />
        </div>
        <div class="form-field">
          <label for="date">Date *</label>
          <p-datepicker inputId="date" formControlName="date" dateFormat="yy/mm/dd" [showIcon]="true"/>
        </div>
        <div class="form-field">
          <label for="lieu">Lieu</label>
          <input id="lieu" pInputText formControlName="lieu" placeholder="Domicile, stade..." />
        </div>
        <div class="form-field">
          <label for="terrain">Terrain</label>
          <p-select inputId="terrain" formControlName="terrain" [options]="terrainOptions" />
        </div>
        <div class="form-field">
          <label for="conditions">Conditions</label>
          <p-select inputId="conditions" formControlName="conditions" [options]="conditionOptions"/>
        </div>
        <div class="form-field">
          <label for="debut">Début</label
          ><input id="debut" pInputText type="time" formControlName="debut" />
        </div>
        <div class="score">
          <p>Est ce que le match est terminé ?<p>
            
          <div class="match-fini-options">
            <div>
              <p-radioButton inputId="match-fini-oui" name="matchFini" [value]="true"
                [ngModel]="matchfini()" (ngModelChange)="matchfini.set($event)"
                [ngModelOptions]="{ standalone: true }" />
              <label for="match-fini-oui">Oui</label>
            </div>
            <div>
              <p-radioButton inputId="match-fini-non" name="matchFini" [value]="false"
                [ngModel]="matchfini()" (ngModelChange)="matchfini.set($event)"
                [ngModelOptions]="{ standalone: true }" />
              <label for="match-fini-non">Non</label>
            </div>
          </div>

          @if (matchfini()) { 
            @if (form.value.fin) {
              <div class="form-field">
                <label for="fin">Fin</label
                ><input id="fin" pInputText type="time" formControlName="fin" />
              </div>
            }
            @if (form.value.score) {
              <span class="score-title">Score final</span>
              <div class="score-fields" formGroupName="score">
                <label>Nous <p-inputnumber formControlName="nous" [min]="0" [showButtons]="true"/></label>
                <label>Adversaire <p-inputnumber formControlName="adversaire" [min]="0" [showButtons]="true"/></label>
              </div>
            }
          }
        </div>
        <div class="actions">
          <p-button label="Annuler" severity="secondary" [text]="true" type="button" (onClick)="cancel()"/>
          <p-button [label]="isEdit() ? 'Sauvegarder' : 'Créer'" icon="pi pi-save" type="submit" [loading]="saving()" [disabled]="form.invalid || loading()" />
        </div>
      </form>
    </p-card>
  `,
  styles: [
    `
      .match-card {
        max-width: 900px;
        width: calc(100% - 2rem);
        margin: 1rem auto;
      }
      .team-name {
        color: var(--p-primary-color);
        font-weight: 600;
        margin-bottom: 1rem;
      }
      .match-form {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
        min-width: 0;
      }
      .form-field {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .form-field.wide,
      .score,
      .actions {
        grid-column: 1 / -1;
      }
      .form-field input,
      .form-field p-datepicker,
      .form-field p-select {
        width: 100%;
        min-width: 0;
      }
      .form-field :is(input, p-datepicker, p-select),
      .form-field :is(p-datepicker, p-select) ::ng-deep > * {
        max-width: 100%;
      }
      .score {
        border-top: 1px solid var(--p-content-border-color);
        padding-top: 1rem;
      }
      .score > p {
        display: inline-block;
        margin: 0 1rem 1rem 0;
        vertical-align: middle;
      }
      .score-title {
        font-weight: 600;
        display: block;
        margin-bottom: 0.75rem;
      }
      .match-fini-options {
        display: inline-flex;
        gap: 1rem;
        margin-bottom: 1rem;
        vertical-align: middle;
      }
      .match-fini-options > div {
        display: flex;
        align-items: center;
        gap: 0.4rem;
      }
      .score-fields {
        display: flex;
        align-items: end;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .score-fields label {
        display: flex;
        flex-direction: column;
        gap: 0.4rem;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        flex-wrap: wrap;
      }
      @media (max-width: 700px) {
        .match-form {
          grid-template-columns: 1fr;
        }
        .score-fields {
          gap: 0.75rem;
        }
      }
    `,
  ],
})
export class MatchEditComponent implements OnInit {
  protected readonly seasons: Saison[] = Saisons;
  protected readonly terrainOptions = TerrainTypes;
  protected readonly conditionOptions = ConditionsMeteo;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly db = inject(DatabaseService);
  private readonly teamService = inject(TeamService);
  private readonly matchService = inject(MatchService);
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);

  readonly team = signal<Equipe>(this.teamService.emptyTeam());
  private match: Match|undefined;
  readonly isEdit = signal(false);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = this.fb.group({
    nomAdversaire: ['', Validators.required],
    date: [new Date(), Validators.required],
    saison: [Saisons[0], Validators.required],
    lieu: ['Domicile'],
    terrain: ['NATUREL' as TerrainType],
    conditions: [['NORMAL' as ConditionMeteo]],
    debut: [''],
    fin: [''],
    score: this.fb.group({
      nous: [0, [Validators.required, Validators.min(0)]],
      adversaire: [0, [Validators.required, Validators.min(0)]],
    }),
  });
  matchfini = signal<boolean>(false);
  
  constructor() {
    effect(() => {
      if (this.matchfini()) {
        if (!this.form.controls.fin.value) {
          this.form.controls.fin.setValue(this.matchService.getHHMM(new Date()));
        }
      } else {
          this.form.controls.fin.setValue('');
      }
    });
  }

  async ngOnInit() {
    try {
      this.loading.set(true);
      let match: Match|undefined = await this.loadMatch();
      if (!match) {
        match = await this.createMatch();
      }
      if (!match) {
        throw new Error('Error technique de creation d un match');
      }

      // chargement du match dans le formulaire.
      this.form.patchValue({
        nomAdversaire: match.nomAdversaire,
        date: new Date(match.date),
        saison: match.saison,
        lieu: match.lieu ?? '',
        terrain: match.terrain ?? 'NATUREL',
        conditions: match.conditions ?? ['NORMAL'],
        debut: match.debut ?? '',
        fin: match.fin ?? '',
        score: {
          nous: match.score?.nous ?? 0,
          adversaire: match.score?.adversaire ?? 0,
        },
      });

      this.matchfini.set(!!this.match!.fin);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadMatch(): Promise<Match|undefined> {
    try {
      const matchId = this.route.snapshot.paramMap.get('matchId');
      if (!matchId) {
        return undefined;
      }
      this.match = await this.db.getMatch(+matchId);
      if (!this.match) throw new Error('Match introuvable: '+matchId);

      const team = await this.db.getTeam(this.match.equipeId);
      if (!team) throw new Error('Match avec une équipe introuvable: '+this.match.equipeId);
      this.team.set(team);

      this.isEdit.set(true);
      return this.match;
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Impossible de charger le match.');
      return undefined;
    }    
  }
  private async createMatch(): Promise<Match|undefined> {
    try {
      const teamId = this.route.snapshot.paramMap.get('teamId');
      if (!teamId) throw new Error('Identifiant equipe manquant lors de la creation d un match.');
      const team = teamId ? await this.db.getTeam(+teamId) : undefined;
      if (!team) throw new Error('Creation de match impossible: Équipe introuvable: ' + teamId);
      this.team.set(team);
      
      const match = this.matchService.emptyMatch();
      match.equipeId = +teamId;
      match.debut = this.matchService.getHHMM(new Date());
      
      const saisonParam = this.route.snapshot.paramMap.get('saison');
      if (saisonParam) {
        match.saison = saisonParam as Saison;
      } else {
        match.saison = this.teamService.currentSeason()
      }

      this.match = match;
      this.isEdit.set(false);
      return this.match;
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Impossible de charger le match.');
      return undefined;
    }
  }

  async save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    try {
      const value = this.form.getRawValue();
      const now = new Date().toISOString();
      const data = {
        ...value,
        date: (value.date as Date).toISOString(),
        equipeId: this.team().id,
        managerId: this.match!.managerId || this.auth.getCurrentManager()!.id,
        createdAt: this.match!.createdAt || now,
        updatedAt: now,
      } as Omit<Match, 'id'>;
      if (this.isEdit()) { 
        this.db.updateMatch({ ...data, id: this.match!.id } as Match);
      } else {
        this.match = await this.db.addMatch(data);
        this.router.navigate(['/app/match', this.match!.id]);
      }
    } catch {
      this.error.set('Impossible de sauvegarder le match.');
    } finally {
      this.saving.set(false);
    }
  }
  cancel() {
    this.router.navigate(['/app/teams', this.team().id]);
  }
}
