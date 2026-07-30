import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { db } from '@core/db/rugby-stats.database';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <main class="app-shell">
      <header>
        <h1>Rugby Stat</h1>
      </header>
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    .app-shell {
        display: flex;
        flex-direction: column;
        height: 100dvh;
        overflow: hidden;
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
  `]
})
export class App implements OnInit {
  private readonly authService = inject(AuthService);
  
  ngOnInit(): void {
    this.authService.initializeAuthPersistenceAndRestoreSession();
  }
}
