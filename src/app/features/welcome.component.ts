import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [ButtonModule],
  template: `
    <section>
      <img class="app-icon" src="/icons/icon-384x384.png" alt="Icône RugbyStats">
      <h2>Bienvenue</h2>

      <p>RugbyStats permet de collecter les statistiques des matchs de rugby de vos équipes.</p>
      <p>Créez un compte ou connectez-vous pour utiliser l'application.</p>

      <div class="buttons">
        <button pButton (click)="accederApp()" severity="info">Accéder à l'application</button>
      </div>

      <section class="install-help" aria-labelledby="install-title">
        <h2 id="install-title">Installer l'application</h2>
        <p>
          RugbyStats peut être installée comme une application sur votre téléphone ou votre ordinateur.
          Ouvrez d'abord cette page en ligne avec votre navigateur.
        </p>

        <details open>
          <summary>Android — Chrome</summary>
          <ol>
            <li>Ouvrez RugbyStats avec Chrome et attendez la fin du chargement.</li>
            <li>Ouvrez le menu <strong>⋮</strong>.</li>
            <li>Choisissez <strong>Installer l'application</strong> ou <strong>Ajouter à l'écran d'accueil</strong>.</li>
            <li>Confirmez avec <strong>Installer</strong>.</li>
          </ol>
        </details>

        <details open>
          <summary>iPhone ou iPad — Safari</summary>
          <ol>
            <li>Ouvrez RugbyStats dans Safari.</li>
            <li>Appuyez sur le bouton <strong>Partager</strong>.</li>
            <li>Choisissez <strong>Sur l'écran d'accueil</strong>.</li>
            <li>Appuyez sur <strong>Ajouter</strong>.</li>
          </ol>
        </details>

        <details open>
          <summary>Ordinateur — Chrome ou Edge</summary>
          <ol>
            <li>Ouvrez RugbyStats dans Chrome ou Edge.</li>
            <li>Cliquez sur l'icône d'installation dans la barre d'adresse, si elle est proposée.</li>
            <li>Sinon, ouvrez le menu du navigateur et choisissez <strong>Installer RugbyStats</strong>.</li>
          </ol>
        </details>


        <p class="install-note">
          Une première ouverture en ligne est nécessaire. Ensuite, l'application peut continuer à
          fonctionner hors ligne pour les données locales ; la synchronisation reprend au retour du réseau.
        </p>
      </section>
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
    .app-icon {
      display: block;
      width: 300px;
      max-width: 100%;
      height: auto;
      margin: 0 auto 1rem;
    }
    p {
      margin: 10px 0;
    }
    .buttons {
      text-align: center;
      margin: 1.25rem 0 2rem;
    }
    .install-help {
      padding: 1rem;
      border: 1px solid #d9e2ec;
      border-radius: 8px;
      background: #f7fafc;
    }
    .install-help h2 {
      color: #0056b3;
    }
    details {
      margin: 0.75rem 0;
      padding: 0.75rem;
      background: #fff;
      border-radius: 6px;
    }
    summary {
      cursor: pointer;
      font-weight: 600;
    }
    li {
      margin: 0.5rem 0;
    }
    .install-note {
      font-size: 0.9rem;
      color: #4a5568;
    }
  `]
})
export class WelcomeComponent {
  private readonly router = inject(Router);

  accederApp() {
    this.router.navigate(['/auth/login']);
  }
}
