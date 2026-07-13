import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h2>Événements d'un match</h2>
    </section>
  `
})
export class EventsComponent {}
