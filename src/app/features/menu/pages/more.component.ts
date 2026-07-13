import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-more',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h2>Plus</h2>
      <p>Page supplémentaire pour le menu.</p>
      <p>Cette page est accessible uniquement après authentification.</p>
    </section>
  `
})
export class MoreComponent {}
