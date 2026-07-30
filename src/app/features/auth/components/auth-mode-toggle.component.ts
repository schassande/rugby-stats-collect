import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthMode, AuthService } from '@core/services/auth.service';


@Component({
  selector: 'auth-mode-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-mode-toggle">
      <label>
        <input type="radio" name="authMode" [checked]="mode()==='firebase'" (change)="setMode('firebase')" /> Firebase
      </label>
      <label>
        <input type="radio" name="authMode" [checked]="mode()==='local'" (change)="setMode('local')" /> Local (Offline)
      </label>
    </div>
  `,
  styles: [
    `
      .auth-mode-toggle { display:flex; gap:1rem; justify-content:center; margin-bottom:1rem; }
      .auth-mode-toggle label { font-size:0.95rem; }
    `
  ]
})
export class AuthModeToggle implements OnInit {
  mode = signal<AuthMode>('firebase');
  authService = inject(AuthService);

  ngOnInit(): void {
    this.mode.set(this.authService.getAuthMode());
  }

 async setMode(m: AuthMode) {
    this.mode.set(m);
    this.authService.setAuthMode(m);
  }
}
