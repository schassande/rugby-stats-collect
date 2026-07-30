import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Equipe } from '@core/models/datamodel';
import { Observable } from 'rxjs';
import { TeamService } from '@core/services/team.service';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <section>
      <h2>Mes Équipes</h2>

      <div class="teams-container">
        <div class="teams-grid">
          @for (team of teams(); track team.id) {
            <p-card class="team-card" (click)="viewTeam(team)">
              <ng-template pTemplate="header">
                @if (team.logo) {
                  <div class="logo">
                    <img src={{team.logo}}/>
                  </div>
                }          
                <div class="team-name">{{ team.nom }}</div>
              </ng-template>
            </p-card>
          } @empty {
           <p>Vous ne gérez aucune équipe pour l'instant. <br>Utiliser le bouton + en bas à droite pour ajouter une nouvelle équipe à gérer.</p>
          }
        </div>
      </div>
      <div class="buttons">
        <p-button icon="pi pi-plus" rounded="true" size="large" (click)="createTeam()"></p-button>
      </div>
    </section>
  `,
  styles: [`
    h2 { 
      text-align: center;
      margin-bottom: 10px;
    }
    p {
      text-align: justify;
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
    .team-name {
      font-size: 1.4rem;
      margin-left: 20px;
    }
    .team-name, .logo {
      display: inline-block;
      vertical-align: middle;
    }
    .logo img {
      max-width: 100px;
      max-height: 100px;
    }

    `]

})
export class TeamListComponent {
  private readonly teamService = inject(TeamService);
  private readonly router = inject(Router);
  teams = toSignal(this.teamService.myTeams(), { initialValue: null });

  viewTeam(team: Equipe) {
    this.router.navigate(['/app/teams', team.id]);
  }

  createTeam() {
    this.router.navigate(['/app/teams/new']);
  }
}
