import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Equipe, Match } from '@core/models/datamodel';
import { DatabaseService } from '@core/services/database.service';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    @if (team()) {
      <div class="team-detail">
        @if (team()?.logo) {
          <div class="logo"><img src={{team()?.logo}}/></div>
        }
        <h2>{{ team()?.nom }}</h2>
        
        <h3>Matchs</h3>
        <div class="matches-list">
          @for(match of matches(); track match.id) {  
            <p-card (click)="viewMatch(match)">
              {{ match.date }} vs {{ match.nomAdversaire }}
              <p>Score: {{ match.score.nous }}-{{ match.score.adversaire }}</p>
            </p-card>
          } @empty {
           <p>Aucun match. Cliquer sur le bouton + pour en ajoutant un.</p>
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
  team = signal<Equipe|undefined>(undefined);
  matches =  signal<Match[]>([]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private db: DatabaseService
  ) {}

  async ngOnInit() {
    const teamId = this.route.snapshot.paramMap.get('teamId');
    if (teamId) {
      this.team.set(await this.db.getTeam(+teamId));
      const t = this.team();
      if (t) {
        this.matches.set(await this.db.getMatchesByTeam(t.id));
      }
    }
  }

  viewMatch(match: Match) {
    this.router.navigate(['/app/matches', match.id]);
  }

  createMatch() {
    const t = this.team();
    if (t) {
      this.router.navigate([`/app/teams/${t.id}/match/new`]);
    }
  }
}
