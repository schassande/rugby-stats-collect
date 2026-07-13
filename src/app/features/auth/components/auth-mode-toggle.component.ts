import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalAuthService } from '@core/services/local-auth.service';
import { setupLocalUsers } from '@core/utils/setup-local-users';

@Component({
  selector: 'auth-mode-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-mode-toggle">
      <label>
        <input type="radio" name="authMode" [checked]="mode==='firebase'" (change)="setMode('firebase')" /> Firebase
      </label>
      <label>
        <input type="radio" name="authMode" [checked]="mode==='local'" (change)="setMode('local')" /> Local (dev/offline)
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
export class AuthModeToggle {
  mode: 'local' | 'firebase' = 'firebase';

  constructor(private readonly localAuth: LocalAuthService) {
    const stored = localStorage.getItem('auth_mode');
    if (stored === 'local' || stored === 'firebase') this.mode = stored;
    else this.mode = (typeof window !== 'undefined' && !!localStorage.getItem('auth_mode')) ? (localStorage.getItem('auth_mode') as any) : 'firebase';
  }

  async setMode(m: 'local' | 'firebase') {
    this.mode = m;
    localStorage.setItem('auth_mode', m);
    if (m === 'local') {
      try {
        await setupLocalUsers(this.localAuth);
      } catch (e) {
        // non-blocking
        console.warn('setupLocalUsers failed', e);
      }
    }
  }
}
