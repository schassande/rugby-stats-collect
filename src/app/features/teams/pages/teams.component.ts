import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Equipe } from '@core/models/datamodel';

@Component({
  selector: 'app-teams',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h2>Accueil</h2>
      <p>Bienvenue dans l'application de collecte de statistiques de match de rugby. 
      <br>Ci-dessous la liste des equipes que vous gérez.
      Utiliser le bouton + en bas à droite pour ajouter une nouvelle équipe à suivre.</p>

      <!-- afficher la liste des équipes gérer par l'utilisateur courant -->
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
    `]

})
export class TeamsComponent {

  equipes: Equipe[] = []
}
