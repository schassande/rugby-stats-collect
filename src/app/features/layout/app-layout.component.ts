import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { TeamService } from '@core/services/team.service';
import { MatchService } from '@core/services/match.service';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
        <router-outlet></router-outlet>
  `,
  styles: [
    `
      :host {
        display: block;
        flex: 1 1 auto;
        min-height: 0;
      }
    `
  ]
})
export class AppLayoutComponent {
}
