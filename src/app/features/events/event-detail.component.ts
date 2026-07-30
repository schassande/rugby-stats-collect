import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section>
      <h2>Administration des Événements</h2>
    </section>
  `
})
export class EventDetailComponent {}
