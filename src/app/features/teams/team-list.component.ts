import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { Equipe } from '@core/models/datamodel';
import { Observable } from 'rxjs';
import { TeamService } from '@core/services/team.service';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { toSignal } from '@angular/core/rxjs-interop';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  template: `
    <section>
      <h2>Mes Équipes</h2>

      <div class="teams-container">
        <div class="teams-grid">
          @for (team of visibleTeams(); track team.id) {
            <p-card styleClass="team-card" (click)="viewTeam(team)">
              <div class="team-header-row">
                  <div class="team-info">
                    @if (team.logo) {
                      <div class="logo"><img src={{team.logo}}/></div>
                    }
                    <div class="team-title">
                      <div class="team-name">{{ team.nom }}</div>
                      <div class="managers">
                        <span class="managers-label">Managers :</span>
                        <ul>
                          @for (manager of managersFor(team); track manager) {
                            <li>{{ manager }}</li>
                          }
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div class="team-actions">
                    <p-button icon="pi pi-pencil" styleClass="team-action-button" severity="info" [text]="true" [rounded]="true"
                      ariaLabel="Modifier l'équipe" title="Modifier l'équipe" (click)="editTeam(team, $event)">
                    </p-button>
                    <p-button icon="pi pi-trash" styleClass="team-action-button" severity="danger" [text]="true" [rounded]="true"
                      ariaLabel="Supprimer l'équipe" title="Supprimer l'équipe" (click)="deleteTeam(team, $event)">
                    </p-button>
                  </div>
              </div>
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
    <p-confirmdialog></p-confirmdialog>
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
    .team-title {
      min-width: 0;
    }
    .team-header-row {
      display: flex;
      align-items: center;
      position: relative;
      width: 100%;
      gap: 10px;
    }
    .team-info {
      display: flex;
      align-items: center;
      gap: 20px;
      padding-right: 90px;
    }
    .team-actions {
      display: flex;
      align-items: center;
      position: absolute;
      top: 0;
      right: 0;
    }
    :host ::ng-deep .team-action-button {
      width: 2.75rem;
      height: 2.75rem;
    }
    :host ::ng-deep .team-action-button .p-button-icon {
      font-size: 1.35rem;
    }
    .team-card .p-card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .team-card {
      width: 500px;
      padding: 10px;
      cursor: pointer;
      margin: 20px auto;
    }
    .managers {
      margin-top: 12px;
    }
    .managers-label {
      font-weight: 600;
    }
    .managers ul {
      margin: 6px 0 0;
      padding-left: 20px;
    }
    .logo img {
      max-width: 150px;
      max-height: 150px;
    }

    `]

})
export class TeamListComponent {
  private readonly teamService = inject(TeamService);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  teams = toSignal(this.teamService.myTeams(), { initialValue: null });
  private readonly deletedTeamIds = signal<Set<string>>(new Set());
  visibleTeams = computed(() => {
    const teams = this.teams() ?? [];
    const deletedIds = this.deletedTeamIds();
    return teams.filter(team => !deletedIds.has(team.id));
  });

  managersFor(team: Equipe): string[] {
    return team.managerIds;
  }

  viewTeam(team: Equipe) {
    this.router.navigate(['/app/teams', team.id]);
  }

  createTeam() {
    this.router.navigate(['/app/teams/new']);
  }

  editTeam(team: Equipe, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/app/teams', team.id, 'edit']);
  }

  deleteTeam(team: Equipe, event: Event) {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: `Supprimer l'équipe « ${team.nom} » ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Annuler',
      acceptLabel: 'Supprimer',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        await this.teamService.deleteTeam(team.id);
        this.deletedTeamIds.update(ids => new Set(ids).add(team.id));
      }
    });
  }
}
