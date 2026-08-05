import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PwaUpdateService {
  private readonly swUpdate = inject(SwUpdate);

  constructor() {
    if (!this.swUpdate.isEnabled) {
      return;
    }

    this.swUpdate.versionUpdates
      .pipe(filter((event): event is VersionReadyEvent => event.type === 'VERSION_READY'))
      .subscribe(() => {
        const reload = window.confirm(
          'Une nouvelle version de RugbyStats est disponible. Recharger maintenant ?'
        );

        if (reload) {
          void this.swUpdate.activateUpdate().then(() => window.location.reload());
        }
      });
  }
}
