import { ApplicationConfig, inject, isDevMode, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import Aura from '@primeuix/themes/aura';
// Firebase est initialisé dans core/config/firebase.config.ts avec le SDK officiel.
import './core/config/firebase.config';
import { AuthService } from './core/services/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideAppInitializer(async () => {
      const auth = inject(AuthService);
      await auth.initializeAuthPersistenceAndRestoreSession();
      await auth.initializeAutoLoginLocal();
    }),
    provideRouter(routes),
    providePrimeNG( { theme: { preset: Aura} }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
