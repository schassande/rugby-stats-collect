import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Saison, Saisons } from '@core/models/datamodel';

@Component({
  selector: 'app-match-edit',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h2>Match de votre équipe</h2>
    </section>
  `
})
export class MatchEditComponent {
  seasons: Saison[] = Saisons;
  season = signal<Saison|undefined>(undefined);

  constructor() {
    const curYear = Number(new Date().getFullYear());
    if (new Date().getMonth() < 6) {
      this.season.set(((curYear-1) + '/' + curYear) as Saison);
    } else {
      this.season.set((curYear + '/' + (curYear+1)) as Saison);
    }

  }
}
