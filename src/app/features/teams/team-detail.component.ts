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

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, SelectModule, ConfirmDialogModule],
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
                </div>
              </div>
            </p-card>
          } @empty {
           <p>Aucun match pour la saison {{season()}}. Cliquer sur le bouton + pour en ajoutant un.</p>
          }
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
      width: 100%;
      max-width: 500px;
      cursor: pointer;
    }
    .match-actions {
      position: absolute;
      top: 0;
      right: 0;
      display: flex;
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

  team = signal<Equipe|undefined>(undefined);
  season = signal<Saison|undefined>(undefined);
  private readonly matchesRefresh = signal(0);
  matches =  computed(async () => {
    this.matchesRefresh();
    const t = this.team()
    const s = this.season();
    return t && s ? await this.db.getMatchesByTeamNSeason(t.id, s) : [];
  });

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
