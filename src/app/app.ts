import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLinkWithHref } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { TeamService } from '@core/services/team.service';
import { MatchService } from '@core/services/match.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { DatabaseService } from '@core/services/database.service';
import { PwaUpdateService } from '@core/services/pwa-update.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLinkWithHref],
  template: `
    <main class="app-shell">
      <header class="app-header">
        <button class="brand-link" type="button" (click)="goToHome()" aria-label="Retour à l'accueil RugbyStats">
          <img class="brand-icon" src="/icons/icon-96x96.png" alt="">
        </button>
        <h1>RugbyStats</h1>
        @if (user()) {
          <button class="logout-link" type="button" (click)="logout()" aria-label="Se déconnecter">
            <i class="pi pi-sign-out" aria-hidden="true"></i>
          </button>
        }
      </header>
      @if (user()) {
        <nav class="tab-bar" aria-label="Navigation principale">
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
            <span>Syncrhonisation ({{pendingSync()}})</span>
          </a>            
        </nav>
        <div class="user-info">
          {{ user()?.prenom }} {{ user()?.nom }} ({{auth.getAuthMode() === 'firebase' ? 'en ligne' : 'local'}})
        </div>
      }
      <div class="app-container">
        <div class="content">
          <router-outlet></router-outlet>
        </div>
      </div>

    </main>
  `,
  styles: [`
    .app-shell {
      position: relative;
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
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
      order: 4;
    }

    .app-header {
      position: relative;
      text-align: center;
      border-bottom: 1px solid #e0e0e0;
      background: yellow;
      order: 1;
    }

    .brand-link {
      position: absolute;
      top: 50%;
      left: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      padding: 0;
      border: 0;
      border-radius: 0.5rem;
      background: transparent;
      cursor: pointer;
      transform: translateY(-50%);
    }

    .brand-link:hover,
    .brand-link:focus-visible {
      background: rgba(0, 86, 179, 0.12);
    }

    .brand-icon {
      width: 2.5rem;
      height: 2.5rem;
      object-fit: contain;
    }

    .logout-link {
      position: absolute;
      top: 50%;
      right: 1rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.5rem;
      border: 0;
      border-radius: 0.5rem;
      background: transparent;
      color: #333;
      cursor: pointer;
      transform: translateY(-50%);
    }

    .logout-link:hover,
    .logout-link:focus-visible {
      background: rgba(0, 86, 179, 0.12);
    }

    @media (max-width: 550px) {
      .logout-link span {
        display: none;
      }
    }

    .tab-bar > a[icon="pi pi-trash"] {
      display: none;
    }

    .content {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      padding: 5px;
      padding-bottom: calc(1rem + env(safe-area-inset-bottom));
      order: 2;
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
      text-align: right;
      padding: 5px;
      order: 3;
    }

    .tab-bar {
      display: flex;
      justify-content: space-around;
      align-items: center;
      flex-shrink: 0;
      padding: 0.75rem 1rem;
      border-bottom: 1px solid #e0e0e0;
      background: #cccccc;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
      position: relative;
      order: 2;
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
export class App {
  private readonly databaseService = inject(DatabaseService);
  protected readonly auth = inject(AuthService);
  private readonly teamService = inject(TeamService);
  private readonly matchService = inject(MatchService);
  private readonly router = inject(Router);
  private readonly pwaUpdateService = inject(PwaUpdateService);

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

  goToHome() {
    void this.router.navigateByUrl(this.user() ? '/app/home' : '/');
  }

}
