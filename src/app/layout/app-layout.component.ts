import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="app-container">
      <div class="content">
        <router-outlet></router-outlet>
      </div>

      <nav class="tab-bar" aria-label="Navigation principale">
        <a href="#" class="tab-item">Match</a>
        <a href="#" class="tab-item">Événements</a>
        <a href="#" class="tab-item">Stats</a>
        <a href="#" class="tab-item">Plus</a>
      </nav>
    </div>
  `,
  styles: [
    `
      .app-container {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }
      .content {
        flex: 1;
      }
      .tab-bar {
        display: flex;
        justify-content: space-around;
        padding: 0.75rem 1rem;
        border-top: 1px solid #e0e0e0;
        background: #fff;
      }
      .tab-item {
        text-decoration: none;
        color: #333;
        font-weight: 600;
      }
    `
  ]
})
export class AppLayoutComponent {
  constructor(private auth: AuthService) {}
}
