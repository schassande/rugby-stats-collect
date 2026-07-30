import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-match-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h2>Les matches de votre équipe</h2>
    </section>
  `
})
export class MatchDetailComponent {
  
}
