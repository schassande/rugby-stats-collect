import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-matches',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h2>Résultats</h2>
      <p>Bienvenue dans l’onglet Stats.</p>
      <p>Cette page est accessible uniquement après authentification.</p>
    </section>
  `
})
export class MatchesComponent {}
