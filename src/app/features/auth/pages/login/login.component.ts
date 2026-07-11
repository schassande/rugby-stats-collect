import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="login-container">
      <h1>GamesStats</h1>
      <form [formGroup]="form" (ngSubmit)="login()">
        <div class="form-field">
          <label for="email">Email</label>
          <input id="email" formControlName="email" type="email" placeholder="Email" />
        </div>

        <div class="form-field">
          <label for="password">Mot de passe</label>
          <input id="password" formControlName="password" type="password" placeholder="Mot de passe" />
        </div>

        <div class="actions">
          <button type="submit">Connexion</button>
          <button type="button" (click)="loginWithGoogle()"><i class="fa-brands fa-google"></i> Google</button>
        </div>
      </form>
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

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
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
      await this.auth.signInWithEmail(email, password);
      await this.router.navigate(['/app']);
    } catch (error: any) {
      this.error = error?.message || 'Erreur de connexion';
    }
  }

  async loginWithGoogle(): Promise<void> {
    try {
      await this.auth.signInWithGoogle();
      await this.router.navigate(['/app']);
    } catch (error: any) {
      this.error = error?.message || 'Erreur Google Sign-In';
    }
  }
}
