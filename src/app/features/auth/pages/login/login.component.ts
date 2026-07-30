import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { AuthModeToggle } from '../../components/auth-mode-toggle.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AuthModeToggle],
  template: `
    <div class="login-container">
      <auth-mode-toggle></auth-mode-toggle>
      <h1>GamesStats</h1>
      <form [formGroup]="form" (ngSubmit)="login()">
        <div class="form-field">
          <label for="email">Email</label>
          <input id="email" formControlName="email" type="email" placeholder="Email" autocomplete="username"/>
        </div>

        <div class="form-field">
          <label for="password">Mot de passe</label>
          <input id="password" formControlName="password" type="password" placeholder="Mot de passe" autocomplete="current-password" />
        </div>

        <div class="actions">
          <button type="submit">Connexion</button>
          <button type="button" (click)="loginWithGoogle()"><i class="fa-brands fa-google"></i> Google</button>
        </div>
      </form>

      <div class="auth-footer">
        <p>Pas encore de compte ? <a routerLink="/auth/signup">Créer un compte</a></p>
      </div>

      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
  styles: [
    `
      .login-container {
        max-width: 420px;
        margin: 8rem auto;
        padding: 2rem;
        background: #ffffff;
        border-radius: 16px;
        box-shadow: 0 18px 30px rgba(0, 0, 0, 0.08);
      }

      h1 {
        margin-bottom: 1.5rem;
        font-size: 2rem;
        text-align: center;
      }

      .form-field {
        margin-bottom: 1rem;
      }

      .actions {
        display: grid;
        gap: 1rem;
      }
    `
  ]
})
export class LoginComponent {
  form: ReturnType<FormBuilder['group']>;
  error: string | null = null;
  private readonly returnUrl: string;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/app';
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  async login(): Promise<void> {
    if (this.form.invalid) {
      return;
    }

    const email = this.form.value.email ?? '';
    const password = this.form.value.password ?? '';

    try {
      await this.auth.loginWithEmail(email, password);
      await this.router.navigate([this.returnUrl]);
    } catch (error: any) {
      this.error = error?.message || 'Erreur de connexion';
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      await this.auth.loginWithGoogle();
      await this.router.navigate([this.returnUrl]);
    } catch (error: any) {
      this.error = error?.message || 'Erreur Google Sign-In';
    }
  }
}
