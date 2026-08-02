import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DatabaseService } from '@core/services/database.service';
import { SyncService } from '@core/services/sync.service';
import { SyncAction, SyncActionStatus } from '@core/models/datamodel';

@Component({
  selector: 'app-sync-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, ButtonModule],
  template: `
    <section class="sync-page">
      <h2>Synchronisations Local / Serveur </h2>
      <h3>Les données en locales ({{nbSyncs()}})</h3>
      @if (isSyncing()) {
        <p>Envoi des données en cours: {{syncDone()}}/{{syncTarget()}}
      } @else {
        <div class="buttons-panel">
          <p-select [options]="statusOptions" [ngModel]="selectedStatus()"
            (ngModelChange)="loadSyncs($event)"
            optionLabel="label" optionValue="value" placeholder="Filtrer par statut"
            ariaLabel="Filtrer les synchronisations par statut" class="status-filter"></p-select>
          <p-button label="Envoyer la sélection" icon="pi pi-refresh" [loading]="isSyncing()"
            [disabled]="isSyncing() || nbSyncs() == 0" (onClick)="synchronize()" class="sync-button"></p-button>
        </div>
        <div class="sync-list" aria-live="polite">
          @for (sync of syncs(); track sync.id) {
            <div class="sync-item">
              <span>{{ sync.objectType }}</span>
              <span>{{ sync.objectId }}</span>
              <span>{{ sync.actionType }}</span>
              <span>{{ statusLabel(sync.status) }}</span>
            </div>
          }
        </div>
      }
    </section>
  `,
  styles: `
    .sync-page { padding: 1rem; }
    h2 { text-align: center; margin-bottom: 1rem; }
    h3 { margin: 1rem 0; }
    .buttons-panel { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .status-filter { width: 200px; max-width: 100%; }
    .sync-button { display: block; margin: 0; }
    .sync-list { display: flex; flex-direction: column; gap: .5rem; }
    .sync-item { 
      display: grid; 
      grid-template-columns: 1fr 1fr 1fr 1fr; 
      gap: .75rem;
      padding: .75rem; border: 1px solid var(--p-surface-300); border-radius: var(--p-border-radius-md);
      background: var(--p-surface-0); }
  `
})
export class SyncListComponent implements OnInit {
  private readonly databaseService = inject(DatabaseService);
  private readonly syncService = inject(SyncService);
  readonly statusOptions = [
    { label: 'Tous les statuts', value: null },
    { label: 'En attente', value: 'pending' as SyncActionStatus },
    { label: 'En cours', value: 'syncing' as SyncActionStatus },
    { label: 'Synchronisée', value: 'synced' as SyncActionStatus },
    { label: 'Conflit', value: 'conflict' as SyncActionStatus },
    { label: 'Échec', value: 'failed' as SyncActionStatus }
  ];
  readonly selectedStatus = signal<SyncActionStatus | undefined>('pending');
  readonly isSyncing = signal(false);
  readonly syncs = signal<SyncAction[]>([]);
  readonly nbSyncs = computed(() => {
    return this.syncs().length
  });
  readonly syncDone = signal<number>(0);
  readonly syncTarget = signal<number>(0);

  statusLabel(status: SyncActionStatus): string {
    return this.statusOptions.find(option => option.value === status)?.label ?? status;
  }

  async ngOnInit(): Promise<void> {
    await this.loadSyncs(this.selectedStatus());
  }

  async loadSyncs(status: SyncActionStatus | undefined): Promise<void> {
    this.selectedStatus.set(status);
    this.syncs.set(await this.databaseService.getSyncs(status));
  }

  async synchronize(): Promise<void> {
    if (this.isSyncing() || this.nbSyncs() === 0) return;
    this.isSyncing.set(true);
    try {
      this.syncTarget.set(this.syncs().length);
      this.syncDone.set(0);
      this.syncs().forEach(async (sync,idx) => {
        await this.syncService.upload(sync);
        this.syncDone.set(idx+1);
      })
      await this.loadSyncs(this.selectedStatus());
    } finally {
      this.isSyncing.set(false);
    }
  }
}
