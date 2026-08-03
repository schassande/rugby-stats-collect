import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { TeamService } from '@core/services/team.service';
import { MatchService } from '@core/services/match.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatabaseService } from '@core/services/database.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref],
  template: `
    <main class="app-shell">
      <header class="app-header">
        <h1>Rugby Stat</h1>
      </header>
      <div class="app-container">
        <div class="content">
          <router-outlet></router-outlet>
        </div>
        @if (user()) {
          <div class="user-info">
            Connecté : {{ user()?.prenom }} {{ user()?.nom }}
            <div>{{equipeSelectionnee() ? equipeSelectionnee()!.id : ''}}</div>
            <div>{{matchSelectionne() ? matchSelectionne()!.id : ''}}</div>
          </div>
          <nav class="tab-bar" aria-label="Navigation principale">
            <a routerLink="/app/welcome" routerLinkActive="active" class="tab-item">
              <i class="fa fa-home nav-icon"></i>
              <span class="nav-label">Accueil</span>
            </a>
            @if (equipeSelectionnee()) {
              <a (click)="voirEquipeSelectionnee()" class="tab-item">
                <i class="fa fa-users nav-icon" aria-hidden="true"></i>
                <span class="nav-label">Mon équipe</span>
              </a>
            }
            @if (matchSelectionne()) {
              <a (click)="voirMatchSelectionne()" class="tab-item">
                <img class="tab-icon nav-icon" src="/icons/rugby.svg" alt="" aria-hidden="true" />
                <span class="nav-label">Le match</span>
              </a>
            }
            <a routerLink="/app/sync" class="tab-item">
              <i class="fa fa-refresh" aria-hidden="true"></i>
              <span>{{pendingSync()}}</span>
            </a>
            
            <a (click)="logout()" icon="pi pi-trash">
              <i class="pi pi-sign-out nav-icon"></i> 
              <span class="nav-label">Se Déconnecter</span>
            </a>
          </nav>
        }
      </div>

    </main>
  `,
  styles: [`
    .app-shell {
      display: flex;
      flex-direction: column;
      height: 100dvh;
      max-width: 900px;
      margin: 0 auto;
      overflow: hidden;
    }
    .app-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }

    .app-header {
      text-align: center;
      border-bottom: 1px solid #e0e0e0;
      background: yellow;
    }

    .content {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      padding: 5px;
      padding-bottom: calc(1rem + env(safe-area-inset-bottom));
    }

    header {
      flex-shrink: 0;
      padding: 1rem;
      background: #fff;
      border-bottom: 1px solid #e0e0e0;
    }

    header h1 {
      text-align: center;
      font-size: 1.3rem;
      font-weight: 700;
    }
    .user-info {
      font-size: 0.9rem;
      color: #555;
      text-align: center;
      padding: 5px;
    }

    .tab-bar {
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-shrink: 0;
      padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom)) 1rem;
      border-top: 1px solid #e0e0e0;
      background: #cccccc;
      box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.08);
      position: sticky;
      bottom: 0;
      z-index: 10;

      
    }
    .nav-label {
      margin-left: 5px;
      font-weight: bold;
    }
    @media (max-width: 550px) { 
      .nav-label { 
        display: none;
      }
    }

    .tab-item {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      text-decoration: none;
      color: #333;
      font-weight: 600;
      padding: 0.25rem 0.5rem;
    }

    .tab-icon {
      width: 1.25rem;
      height: 1.25rem;
      display: block;
    }

    .active {
      color: #007bff;
    }
    
  `]
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly databaseService = inject(DatabaseService);
  private readonly auth = inject(AuthService);
  private readonly teamService = inject(TeamService);
  private readonly matchService = inject(MatchService);
  private readonly router = inject(Router);

  user = toSignal(this.auth.currentManager$);
  equipeSelectionnee = toSignal(this.teamService.currentTeam$);
  matchSelectionne = toSignal(this.matchService.currentMatch$);
  pendingSync = toSignal(this.databaseService.currentPendingSync$)

  voirMatchSelectionne() {
    this.router.navigate(['/app/match', this.matchSelectionne()!.id])
  }
  voirEquipeSelectionnee() {
    this.router.navigate(['/app/teams', this.equipeSelectionnee()!.id])
  }

  async logout() {
    await this.auth.signOut();
    await this.router.navigateByUrl('/');
  }

  ngOnInit(): void {
    this.authService.initializeAuthPersistenceAndRestoreSession();
  }
}
