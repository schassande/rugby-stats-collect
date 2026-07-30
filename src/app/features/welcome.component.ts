import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { Route, Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [ButtonModule, CommonModule],
  template: `
    <section>
      <h2>Bienvenue</h2>

      <p>L'application RugbyStat permet de collecter des statistiques 
      sur les matches de rugby de vos équipes.</p>
      
      <p>Créez vous un compte ou connecter vous pour utiliser l'application.</p>
      <div class="buttons">
        <button pButton (click)="accederApp()" severity="info">Acceder à l'application</button>
      </div>
    </section>
  `,
  styles: [`
    section { 
      padding: 10px;
      margin: 0 auto;
      max-width: 600px;
    }
    h2 { 
      text-align: center;
      margin: 10px 0;
    }
    p {
      margin: 10px 0; 
    }
    .buttons {
      text-align: center;
    }
    `]
})
export class WelcomeComponent {
  private readonly router = inject(Router);
  accederApp() {
    this.router.navigate(['/auth/login']);
  }
}
