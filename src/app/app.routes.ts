import { Routes } from '@angular/router';
import { AppLayoutComponent } from './features/layout/app-layout.component';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/welcome', pathMatch: 'full' },

  { // Page d'accueil de l'application. Public
    path: 'welcome',
    loadComponent: () => import('./features/welcome.component').then((m) => m.WelcomeComponent)
  },

  { // pages d'authification de l'utilisateur
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },

  { // les pages de l'application
    path: 'app',
    component: AppLayoutComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },

      { // Page d'accueil de l'utilisateur connecté. affichage de la liste de ses équipes
        path: 'home',
        loadComponent: () => import('./features/teams/team-list.component').then((m) => m.TeamListComponent)
      },
      {
        path: 'sync',
        loadComponent: () => import('./features/sync/sync-list.component').then((m) => m.SyncListComponent)
      },
      { // Page de creation d'une équipe
        path: 'teams/new',
        loadComponent: () => import('./features/teams/team-edit.component').then((m) => m.TeamEditComponent)
      },
      { //Page d edition d'une équipe
        path: 'teams/:teamId/edit',
        loadComponent: () => import('./features/teams/team-edit.component').then((m) => m.TeamEditComponent)
      },
      { // Page de consultation d'une équipe
        path: 'teams/:teamId',
        loadComponent: () => import('./features/teams/team-detail.component').then((m) => m.TeamDetailComponent)
      },


      { // Page de creation  d'un match pour une équipe
        path: 'teams/:teamId/match/new',
        loadComponent: () => import('./features/matches/match-edit.component').then((m) => m.MatchEditComponent)
      },
      { // Page de modification  d'un match
        path: 'match/:matchId/edit',
        loadComponent: () => import('./features/matches/match-edit.component').then((m) => m.MatchEditComponent)
      },
      { // Page de consultation d'un match
        path: 'match/:matchId',
        loadComponent: () => import('./features/matches/match-detail.component').then((m) => m.MatchDetailComponent)
      },


      { // Page de creation d'un evenement pour un match
        path: 'match/:matchId/event/new',
        loadComponent: () => import('./features/events/event-edit.component').then((m) => m.EventEditComponent)
      },

      { // Page de consultation d'un evenement d'un match
        path: 'event/:eventId/edit',
        loadComponent: () => import('./features/events/event-edit.component').then((m) => m.EventEditComponent)
      },

      { // Page de modification d'un evenement
        path: 'event/:eventId',
        loadComponent: () =>  import('./features/events/event-detail.component').then((m) => m.EventDetailComponent)
      },

      { path: '**', redirectTo: 'home' }
    ]
  },
  { path: '**', redirectTo: '/welcome' }
];
