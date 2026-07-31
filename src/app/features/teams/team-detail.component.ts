import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Equipe, Match, Saison, Saisons } from '@core/models/datamodel';
import { DatabaseService } from '@core/services/database.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TeamService } from '@core/services/team.service';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, SelectModule],
  template: `
    @if (team()) {
      <div class="team-detail">
        @if (team()?.logo) {
          <div class="logo"><img src={{team()?.logo}}/></div>
        }
        <h2>{{ team()?.nom }}</h2>

        <h3>Matchs</h3>
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
            <p-card (click)="viewMatch(match)">
              {{ match.date | date:'yyyy/MM/dd' }} {{ match.debut }} vs {{ match.nomAdversaire }} à {{match.lieu}}
              @if (match.fin) {
                <p>Terminé à {{match.fin}} sur 
                  {{ match.score.nous > match.score.adversaire 
                    ? "une victoire" : 
                      match.score.nous < match.score.adversaire 
                      ? "une défaite" : "une égalite "
                  }}
                  {{ match.score.nous }}-{{ match.score.adversaire }}</p>
              }
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
  `,
  styles: [`
    h2 { 
      text-align: center;
      margin-bottom: 10px;
    }
    .season-selector {
      margin: 0 0 20px;
      display: flex;
      align-items: center;
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
    .buttons {
      position: absolute;
      bottom: 90px;
      right: 10px;
    }
    .buttons pi{
      font-weight: bold;
      font-size: 1.5rem;
    }
    `]
})
export class TeamDetailComponent implements OnInit {
  protected readonly seasons: Saison[] = Saisons;
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private db = inject(DatabaseService);
  private teamService = inject(TeamService);

  team = signal<Equipe|undefined>(undefined);
  season = signal<Saison|undefined>(undefined);
  matches =  computed(async () => {
    const t = this.team()
    const s = this.season();
    return t && s ? await this.db.getMatchesByTeamNSeason(t.id, s) : [];
  });

  async ngOnInit() {
    this.season.set(this.teamService.currentSeason());
    const teamId = this.route.snapshot.paramMap.get('teamId');
    if (teamId) {
      this.team.set(await this.db.getTeam(+teamId));
    } else {
      this.router.navigate(['/app/home']);      
    }
  }

  viewMatch(match: Match) {
    this.router.navigate(['/app/match', match.id]);
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
}
