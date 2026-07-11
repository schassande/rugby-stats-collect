import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: 'app',
    component: AppLayoutComponent,
    children: [
      { path: '', redirectTo: 'teams', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: '/auth' }
];
