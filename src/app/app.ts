import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { db } from '@core/db/rugby-stats.database';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('GamesStats');

  constructor(private readonly auth: AuthService, private readonly router: Router) {
    this.auth.handleGoogleRedirectResult()
      .then((hasUser) => {
        if (hasUser) {
          this.router.navigate(['/app']);
        }
      })
      .catch((err) => {
        console.error('Erreur de redirection Google Auth:', err);
      });

    this.auth.isAuthenticated$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.router.navigate(['/app']);
      }
    });
  }
}
