import { ApplicationConfig, isDevMode, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { providePrimeNG } from 'primeng/config';
import { routes } from './app.routes';
import Aura from '@primeuix/themes/aura';
// Firebase est initialisé dans core/config/firebase.config.ts avec le SDK officiel.
import './core/config/firebase.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG( { theme: { preset: Aura} }),
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000'
    })
  ]
};
