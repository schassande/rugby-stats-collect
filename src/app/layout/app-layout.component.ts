import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <div class="content">
        <router-outlet></router-outlet>
      </div>

      <div class="user-info" *ngIf="user$ | async as user">
        Connecté : {{ user.email }}
      </div>
      <nav class="tab-bar" aria-label="Navigation principale">
        <a routerLink="/app/welcome" routerLinkActive="active" class="tab-item">Accueil</a>
        <a routerLink="/app/team" routerLinkActive="active" class="tab-item">Equipe</a>
        <a routerLink="/app/game" routerLinkActive="active" class="tab-item">Match</a>
      </nav>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        flex: 1 1 auto;
        min-height: 0;
      }

      .app-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }

      .app-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        border-bottom: 1px solid #e0e0e0;
        background: #fff;
      }

      .brand {
        font-weight: 700;
        font-size: 1.05rem;
      }

      .user-info {
        font-size: 0.9rem;
        color: #555;
        text-align: center;
        padding: 5px;
      }

      .content {
        flex: 1 1 auto;
        min-height: 0;
        overflow-y: auto;
        padding: 1rem;
        padding-bottom: calc(1rem + env(safe-area-inset-bottom));
      }

      .tab-bar {
        display: flex;
        justify-content: space-around;
        align-items: center;
        flex-shrink: 0;
        padding: 0.75rem 1rem calc(0.75rem + env(safe-area-inset-bottom)) 1rem;
        border-top: 1px solid #e0e0e0;
        background: #fff;
        box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.08);
        position: sticky;
        bottom: 0;
        z-index: 10;
      }

      .tab-item {
        text-decoration: none;
        color: #333;
        font-weight: 600;
        padding: 0.25rem 0.5rem;
      }

      .active {
        color: #007bff;
      }
    `
  ]
})
export class AppLayoutComponent {
  public get user$() {
    return this.auth.currentUser$;
  }

  constructor(private readonly auth: AuthService) {}
}
