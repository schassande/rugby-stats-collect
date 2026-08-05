import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { ConfirmationService } from 'primeng/api';
import { SyncDashboardService, SyncDashboardRow } from '@core/services/sync-dashboard.service';
import { Equipe, SyncAction } from '@core/models/datamodel';

@Component({
  selector: 'app-sync-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SelectModule,
    TableModule,
    ButtonModule,
    DialogModule,
    MessageModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './sync-dashboard.component.html',
  styles: `
    .sync-page {
      padding: 1.5rem;
    }
    .sync-page h2 {
      text-align: center;
      margin: 0 0 1.5rem;
    }
    .sync-page > p-select,
    .sync-page > p-button,
    .sync-page > p-message,
    .sync-page > p-table {
      display: block;
      margin-bottom: 1rem;
    }
    .sync-page > p-table {
      margin-top: 1.5rem;
    }
    .sync-page .team-select {
      display: inline-flex;
      width: min(100%, 24rem);
    }
    .team-controls {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .team-controls > p-button {
      flex: 0 0 auto;
    }
    @media (max-width: 600px) {
      .team-controls {
        align-items: stretch;
        flex-direction: column;
      }
      .team-select {
        width: 100% !important;
      }
    }
    .send-actions {
      display: flex;
      justify-content: flex-end;
      margin: 1rem 0;
    }
    .event-count {
      color: var(--p-text-muted-color);
      display: block;
      text-align: center;
    }
    .match-check, .event-count {
      text-align: center;
    }
    .cell-data {
      text-align: center;
    }
  `,
})
export class SyncDashboardComponent implements OnInit {
  readonly service = inject(SyncDashboardService);
  teams = signal<Equipe[]>([]);
  selected = signal<string | undefined>(undefined);
  rows = signal<SyncDashboardRow[]>([]);
  busy = signal(false);
  error = signal<string | undefined>(undefined);
  loading = signal(false);
  async ngOnInit() {
    await this.loadTeams();
  }
  async loadTeams() {
    try {
      await this.service.downloadTeams();
      this.teams.set(await this.service.teams());
      const id = localStorage.getItem('sync-team') ?? this.teams()[0]?.id;
      if (id) {
        this.selected.set(id);
        await this.reload();
      }
    } catch (e) {
      this.error.set(String(e));
    }
  }
  async reload() {
    if (!this.selected()) return;
    this.loading.set(true);
    try {
      this.rows.set(await this.service.load(this.selected()!));
      localStorage.setItem('sync-team', this.selected()!);
      this.error.set(undefined);
    } catch (e) {
      this.error.set(String(e));
    } finally {
      this.loading.set(false);
    }
  }
  async run(fn: () => Promise<void>) {
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await fn();
      await this.reload();
    } catch (e) {
      this.error.set(String(e));
    } finally {
      this.busy.set(false);
    }
  }
  action(row: SyncDashboardRow) {
    const a = row.actions.find((x) => x.status !== 'synced');
    return a;
  }
  async delete(row: SyncDashboardRow) {
    if (
      confirm(
        'Supprimer le match et ses événements localement ? Les données distantes resteront intactes.',
      )
    )
      await this.run(() => this.service.deleteLocal(row));
  }
  async download(row: SyncDashboardRow) {
    await this.run(() => this.service.download(row));
  }
  async send() {
    await this.run(() => this.service.sendPending(this.selected()!));
  }
  async retry(row: SyncDashboardRow) {
    const a = this.action(row);
    if (a) await this.run(() => this.service.retry(a));
  }
}
