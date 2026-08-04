import { Component, EventEmitter, inject, model, OnInit, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthMode, AuthService } from '@core/services/auth.service';


@Component({
  selector: 'auth-mode-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="auth-mode-toggle">
      <label>
        <input type="radio" name="authMode" [checked]="mode()==='firebase'" (change)="setMode('firebase')" /> Mode en ligne
      </label>
      <label>
        <input type="radio" name="authMode" [checked]="mode()==='local'" (change)="setMode('local')" /> Mode hors ligne
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
  public mode = model<AuthMode>('firebase');
  authService = inject(AuthService);

  ngOnInit(): void {
    this.mode.set(this.authService.getAuthMode());
  }

 async setMode(m: AuthMode) {  
    this.authService.setAuthMode(m);
    this.mode.set(m);
    console.log('Auth mode ', m);
  }
}
