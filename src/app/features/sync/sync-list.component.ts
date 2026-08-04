import { CommonModule } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { DatabaseService } from '@core/services/database.service';
import { SyncService } from '@core/services/sync.service';
import { SyncAction, SyncActionStatus } from '@core/models/datamodel';

@Component({
  selector: 'app-sync-list',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectModule, ButtonModule, ConfirmDialogModule],
  providers: [ConfirmationService],
  template: `
    <section class="sync-page">
      <h2>Synchronisations Local / Serveur </h2>
      @if (isSyncing()) {
        <p>Envoi des données en cours: {{syncDone()}}/{{syncTarget()}}
      } @else {
        <h3>Les données en locales ({{nbSyncs()}})</h3>
          <div class="buttons-panel">
            <p-select [options]="statusOptions" [ngModel]="selectedStatus()"
              (ngModelChange)="loadSyncs($event)"
              optionLabel="label" optionValue="value" placeholder="Filtrer par statut"
              ariaLabel="Filtrer les synchronisations par statut" class="status-filter"></p-select>
            <p-button label="Envoyer la sélection" icon="fa fa-paper-plane" [loading]="isSyncing()"
              [disabled]="isSyncing() || nbSyncs() == 0" (onClick)="synchronize()" class="sync-button"></p-button>
            <p-button label="Supprimer les synchronisations terminées" icon="fa fa-trash"
              severity="danger" [outlined]="true" [disabled]="isSyncing()"
              (onClick)="deleteSynced()" class="sync-button"></p-button>
          </div>
          <div class="sync-list" aria-live="polite">
            @for (sync of syncs(); track sync.id) {
              <div class="sync-item">
                <span>{{ sync.objectType }}</span>
                <span>{{ sync.objectId }}</span>
                <span>{{ sync.actionType }}</span>
                <span>{{ statusLabel(sync.status) }}</span>
                <div class="sync-actions">
                  <p-button icon="fa fa-paper-plane" severity="primary" [text]="true" [rounded]="true"
                    [disabled]="isSyncing()" ariaLabel="Synchroniser cette ligne" label="Synchroniser cette ligne"
                    (click)="synchronizeOne(sync, $event)"></p-button>
                  <p-button icon="fa fa-trash" severity="danger" [text]="true" [rounded]="true"
                    [disabled]="isSyncing()" ariaLabel="Supprimer la synchronisation" title="Supprimer la synchronisation"
                    (click)="deleteSync(sync, $event)"></p-button>
                </div>
              </div>
            }
          </div>
        <h3>Les données sur le serveur</h3>
        <div class="sync-actions">
          <p-button label="Récupérer mes equipes" icon="fa fa-download" [loading]="isSyncing()"
              [disabled]="isSyncing()" (onClick)="recupererMesEquieps()" class="sync-button"></p-button>
        </div>
      }
    </section>
    <p-confirmdialog></p-confirmdialog>
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
      grid-template-columns: 1fr 1fr 1fr 1fr auto; 
      gap: .75rem;
      padding: .75rem; border: 1px solid var(--p-surface-300); border-radius: var(--p-border-radius-md);
      background: var(--p-surface-0); }
    .sync-actions { display: flex; align-items: center; gap: .25rem; }
  `
})
export class SyncListComponent implements OnInit {
  private readonly databaseService = inject(DatabaseService);
  private readonly syncService = inject(SyncService);
  private readonly confirmationService = inject(ConfirmationService);
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
    this.syncs.set(this.syncService.sortSyncs(await this.databaseService.getSyncs(status)));
  }

  deleteSync(sync: SyncAction, event: Event): void {
    event.stopPropagation();
    this.confirmationService.confirm({
      message: `Supprimer la synchronisation de ${sync.objectType} #${sync.objectId} ?`,
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Annuler',
      acceptLabel: 'Supprimer',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        await this.databaseService.deleteSync(sync.id);
        await this.loadSyncs(this.selectedStatus());
      }
    });
  }

  async synchronizeOne(sync: SyncAction, event: Event): Promise<void> {
    event.stopPropagation();
    if (this.isSyncing()) return;

    this.isSyncing.set(true);
    try {
      await this.syncService.upload(sync);
      await this.loadSyncs(this.selectedStatus());
    } finally {
      this.isSyncing.set(false);
    }
  }

  deleteSynced(): void {
    this.confirmationService.confirm({
      message: 'Supprimer toutes les synchronisations avec le statut « synchronisée » ?',
      header: 'Confirmation de suppression',
      icon: 'pi pi-exclamation-triangle',
      rejectLabel: 'Annuler',
      acceptLabel: 'Supprimer',
      acceptButtonStyleClass: 'p-button-danger',
      accept: async () => {
        await this.databaseService.deleteSyncsByStatus('synced');
        await this.loadSyncs(this.selectedStatus());
      }
    });
  }

  async synchronize(): Promise<void> {
    if (this.isSyncing() || this.nbSyncs() === 0) return;
    this.isSyncing.set(true);
    try {
      this.syncTarget.set(this.syncs().length);
      this.syncDone.set(0);
      await Promise.all(
        this.syncService.sortSyncs(this.syncs()).map((sync) => 
          this.syncService.upload(sync)
            .then(()=> this.syncDone.update(v=>v+1)))
      );
      await this.loadSyncs(this.selectedStatus());
    } finally {
      this.isSyncing.set(false);
    }
  }
  async recupererMesEquieps() {
    await this.syncService.chargerMesEquipes();
  }
}
