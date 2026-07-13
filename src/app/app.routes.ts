import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: 'app',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'teams', pathMatch: 'full' },
      {
        path: 'welcome',
        loadComponent: () => import('./features/teams/pages/teams.component').then((m) => m.TeamsComponent)
      },
      {
        path: 'events',
        loadComponent: () => import('./features/events/pages/events.component').then((m) => m.EventsComponent)
      },
      {
        path: 'matches',
        loadComponent: () => import('./features/matches/pages/matches.component').then((m) => m.MatchesComponent)
      },
      { path: '**', redirectTo: 'teams' }
    ]
  },
  { path: '**', redirectTo: '/auth' }
];
