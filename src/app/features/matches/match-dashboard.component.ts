import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Component, Input } from '@angular/core';
import { SelectModule } from 'primeng/select';
import { Equipe, Evenement, Match } from '@core/models/datamodel';

type PeriodeFiltre = 1 | 2 | 'MATCH';

@Component({
  selector: 'app-match-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule],
  template: `
    <section class="dashboard" aria-label="Tableau de synthese du match">
      <div class="period-filter">
        <label for="match-period">Periode</label>
        <p-select inputId="match-period" [options]="periodOptions" optionLabel="label"
          optionValue="value" [(ngModel)]="selectedPeriod" (onChange)="periodChanged()" />
      </div>

      <table>
        <thead>
          <tr><th>Nature d'evenement</th><th>Nous</th><th>Adversaire</th></tr>
        </thead>
        <tbody>
          @for (nature of natures; track nature) {
            <tr>
              <th scope="row">{{ nature }}</th>
              <td><ng-container *ngTemplateOutlet="eventsCell; context: { events: eventsFor(nature, 'NOUS') }" /></td>
              <td><ng-container *ngTemplateOutlet="eventsCell; context: { events: eventsFor(nature, 'ADV') }" /></td>
            </tr>
          }
        </tbody>
      </table>
    </section>

    <ng-template #eventsCell let-events="events">
      @for (event of events; track event.type) {
        <div class="event-line">{{ event.type }}: {{ event.count }}</div>
      } @empty { <span class="empty">-</span> }
    </ng-template>
  `,
  styles: [`
    .dashboard { width: min(100%, 400px); margin: 1.25rem auto; }
    .period-filter { display: flex; align-items: center; justify-content: flex-end; gap: .5rem; margin-bottom: .75rem; }
    .period-filter p-select { width: 170px; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; font-size: .9rem; }
    th, td { padding: .55rem .4rem; border: 1px solid var(--p-content-border-color); vertical-align: top; text-align: center; }
    thead th:first-child, tbody th { width: 34%; text-align: left; }
    thead th { background: var(--p-content-hover-background); }
    .event-line { line-height: 1.45; text-align: left; }
    .empty { color: var(--p-text-muted-color); }
    @media (max-width: 420px) { .period-filter { justify-content: space-between; } table { font-size: .8rem; } }
  `]
})
export class MatchDashboardComponent {
  @Input({ required: true }) team!: Equipe;
  @Input({ required: true }) match!: Match;
  @Input() events: Evenement[] = [];

  readonly natures = ['SCORE', 'CONQUETE', 'DISCIPLINE', 'FAIT_DE_JEU', 'ERREUR', 'REMPLACEMENT'];
  readonly periodOptions = [
    { label: 'Match complet', value: 'MATCH' as PeriodeFiltre },
    { label: '1re mi-temps', value: 1 as PeriodeFiltre },
    { label: '2e mi-temps', value: 2 as PeriodeFiltre },
  ];
  selectedPeriod: PeriodeFiltre = 'MATCH';

  periodChanged(): void { /* Le binding est volontairement conserve pour le composant autonome. */ }

  eventsFor(nature: string, equipe: string): { type: string; count: number }[] {
    const counts = new Map<string, number>();
    this.events
      .filter(event => event.nature === nature && event.equipe === equipe)
      .filter(event => this.selectedPeriod === 'MATCH' || event.periode === this.selectedPeriod)
      .forEach(event => counts.set(event.type, (counts.get(event.type) ?? 0) + 1));
    return [...counts.entries()].map(([type, count]) => ({ type, count }));
  }
}
