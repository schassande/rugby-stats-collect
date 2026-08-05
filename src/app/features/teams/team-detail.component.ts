import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Equipe, Match, Saison, Saisons } from '@core/models/datamodel';
import { DatabaseService } from '@core/services/database.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TeamService } from '@core/services/team.service';
import { ExportExcelService } from '@core/services/export-excel.service';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, SelectModule, CheckboxModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  template: `
    @if (team()) {
      <div class="team-detail">
        @if (team()?.logo) {
          <div class="logo"><img src={{team()?.logo}}/></div>
        }
        <h2>
          Match des <span>{{ team()?.nom }}</span>
          <div><i class="fa fa-pencil link" aria-hidden="true" (click)="editTeam()"></i></div>
        </h2>

        <div class="season-selector">
          <label for="season">Saison</label>
          <p-select
            inputId="season"
            [options]="seasons"
            [(ngModel)]="season"
            placeholder="Choisir une saison"
            fluid="true">
          </p-select>
        </div>
        
        <div class="matches-list">
          @for(match of matches() | async; track match.id) {  
            <div class="match-card-container">
              @if (multipleExport()) {
                <p-checkbox [binary]="true" [ngModel]="isSelected(match.id)"
                  (ngModelChange)="toggleMatch(match.id, $event)"
                  (click)="$event.stopPropagation()" />
              }
              <p-card styleClass="match-card" (click)="viewMatch(match)">
                <div class="match-row">
                <div class="match-content">
              <strong>{{ match.date | date:'yyyy/MM/dd' }} {{ match.temps?.debutMatch| date:'HH:mm' }} vs {{ match.nomAdversaire }} </strong>
              <div>à {{match.lieu}}</div>
              @if (match.temps?.finMatch) {
                <p>Terminé à {{match.temps!.finMatch | date:'HH:mm' }} sur 
                  {{ match.score!.nous > match.score!.adversaire 
                    ? "une victoire" : 
                      match.score!.nous < match.score!.adversaire 
                      ? "une défaite" : "une égalite "
                  }}
                  {{ match.score!.nous }}-{{ match.score!.adversaire }}</p>
              }
              </div>
                <div class="match-actions">
                  <p-button icon="pi pi-pencil" styleClass="match-action-button" severity="info" [text]="true" [rounded]="true"
                    ariaLabel="Modifier le match" title="Modifier le match" (click)="editMatch(match, $event)">
                  </p-button>
                  <p-button icon="pi pi-trash" styleClass="match-action-button" severity="danger" [text]="true" [rounded]="true"
                    ariaLabel="Supprimer le match" title="Supprimer le match" (click)="deleteMatch(match, $event)">
                  </p-button>
                  <p-button icon="pi pi-file-excel" styleClass="match-action-button" severity="success" [text]="true" [rounded]="true"
                    ariaLabel="Exporter ce match" title="Exporter ce match" [loading]="exporting()" [disabled]="exporting()" (click)="exportOne(match, $event)">
                  </p-button>
                </div>
                </div>
              </p-card>
            </div>
          } @empty {
           <p>Aucun match pour la saison {{season()}}. Cliquer sur le bouton + pour en ajoutant un.</p>
          }
        </div>
        <div class="export-actions">
          <div class="multiple-export-toggle">
            <p-checkbox inputId="multiple-export" [binary]="true" [ngModel]="multipleExport()" (ngModelChange)="setMultipleExport($event)" />
            <label for="multiple-export">Export Excel multiple</label>
          </div>
          <p-button [label]="allSelected() ? 'Désélectionner tous' : 'Sélectionner tous'" (click)="toggleAll()" [disabled]="!multipleExport() || exporting()" />
          <p-button [label]="'Exporter ' + selectedIds().size + ' match' + (selectedIds().size > 1 ? 's' : '')" [disabled]="!multipleExport() || !selectedIds().size || exporting()" [loading]="exporting()" (click)="exportMany()" />
        </div>
        <div class="buttons">
          <p-button icon="pi pi-plus" rounded="true" size="large" severity="success" (click)="createMatch()"></p-button>
        </div>
      </div>
    }
    <p-confirmdialog></p-confirmdialog>
  `,
  styles: [`
    h2 { 
      text-align: center;
      margin-bottom: 10px;
    }
    .season-selector {
      margin: 30px 0 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
    }
    .season-selector label {
      flex: 0 0 auto;
    }
    .season-selector p-select {
      flex: 1;
      max-width: 300px;
    }
    .logo {
      text-align: center;
    }
    .logo img {
      max-width: 100px;
      max-height: 100px;
      margin: 10px auto;
    }
    .match-row {
      display: flex;
      align-items: center;
      position: relative;
      gap: 10px;
    }
    .match-content {
      flex: 1;
      padding-right: 90px;
    }
    .matches-list {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .match-card {
      flex: 1;
      max-width: 500px;
      cursor: pointer;
    }
    .match-card-container {
      display: flex;
      align-items: center;
      width: 100%;
      max-width: 540px;
      gap: 12px;
    }
    .match-actions {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
    }
    .export-actions {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
      margin-top: 24px;
    }
    .multiple-export-toggle {
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }
    .multiple-export-toggle label {
      cursor: pointer;
    }
    :host ::ng-deep .match-action-button .p-button-icon {
      font-size: 1.35rem;
    }
    .buttons {
      position: absolute;
      bottom: 90px;
      right: 10px;
    }
    .buttons pi{
      font-weight: bold;
      font-size: 1.5rem;
    }
    .link { margin-left: 10px; }
    .link:hover { cursor: pointer; }
  `]
})
export class TeamDetailComponent implements OnInit {
  protected readonly seasons: Saison[] = Saisons;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private db = inject(DatabaseService);
  private teamService = inject(TeamService);
  private confirmationService = inject(ConfirmationService);
  private exportService = inject(ExportExcelService);

  team = signal<Equipe | undefined>(undefined);
  season = signal<Saison | undefined>(undefined);
  private readonly matchesRefresh = signal(0);
  readonly multipleExport = signal(false);
  readonly selectedIds = signal<Set<string>>(new Set());
  readonly matchCount = signal(0);
  readonly exporting = signal(false);
  matches = computed(async () => {
    this.matchesRefresh();
    const t = this.team();
    const s = this.season();
    const result = t && s ? await this.db.getMatchesByTeamNSeason(t.id, s) : [];
    this.matchCount.set(result.length);
    this.selectedIds.set(new Set());
    return result;
  });

  /** Charge l’équipe et la saison affichées par la route courante. */
  async ngOnInit() {
    this.season.set(this.teamService.currentSeason());
    const teamId = this.route.snapshot.paramMap.get('teamId');
    if (teamId) {
      this.team.set(await this.db.getTeam(teamId));
    } else {
      this.router.navigate(['/app/home']);
      return;
    }
    this.teamService.setCurrentTeam(this.team());
  }

  /** Active ou désactive le mode d’export multiple et réinitialise sa sélection. */
  setMultipleExport(value: boolean) {
    this.multipleExport.set(value);
    if (!value) this.selectedIds.set(new Set());
  }

  /** Indique si un match est actuellement sélectionné pour l’export. */
  isSelected(id: string): boolean {
    return this.selectedIds().has(id);
  }

  /** Ajoute ou retire un match de la sélection d’export. */
  toggleMatch(id: string, checked: boolean): void {
    const next = new Set(this.selectedIds());
    checked ? next.add(id) : next.delete(id);
    this.selectedIds.set(next);
  }

  /** Sélectionne tous les matchs affichés ou les désélectionne s’ils le sont déjà tous. */
  async toggleAll(): Promise<void> {
    const list = await this.matches();
    this.selectedIds.set(this.allSelected() ? new Set() : new Set(list.map((match) => match.id)));
  }

  /** Indique si tous les matchs de la liste courante sont sélectionnés. */
  allSelected(): boolean {
    return this.matchCount() > 0 && this.selectedIds().size === this.matchCount();
  }

  /** Exporte immédiatement un seul match depuis sa carte. */
  async exportOne(match: Match, event: Event): Promise<void> {
    event.stopPropagation();
    await this.exportMatches([match]);
  }

  /** Exporte les matchs sélectionnés dans un fichier unique. */
  async exportMany(): Promise<void> {
    const ids = this.selectedIds();
    const matches = (await this.matches()).filter((match) => ids.has(match.id));
    await this.exportMatches(matches);
  }

  /** Charge les événements locaux et délègue la génération du classeur au service. */
  private async exportMatches(matches: Match[]): Promise<void> {
    if (!matches.length || this.exporting()) return;

    this.exporting.set(true);
    try {
      const events = (await Promise.all(matches.map((match) => this.db.getEventsByMatch(match.id)))).flat();
      this.exportService.export(matches, events, this.team()!);
    } finally {
      this.exporting.set(false);
    }
  }

  viewMatch(match: Match) {
    this.router.navigate(['/app/match', match.id]);
  }

  async deleteMatch(match: Match, event: Event) {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: `Supprimer le match contre ${match.nomAdversaire} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Annuler',
      acceptLabel: 'Supprimer',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        await this.db.deleteMatch(match.id);
        this.matchesRefresh.update(value => value + 1);
      }
    });
  }

  createMatch() {
    const t = this.team();
    if (t) {
      this.router.navigate(
        ['/app/teams', t.id, 'match', 'new'],
        { queryParams: { saison: this.season() } }
      );
    }
  }
  editMatch(match: Match, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/app/match', match.id, 'edit']);
  }
  editTeam() {
    const t = this.team();
    if (t) {
      this.router.navigate(['/app/teams', t.id, 'edit']);
    }
  }
}
