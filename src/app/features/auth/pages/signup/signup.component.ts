import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '@core/services/auth.service';
import { AuthModeToggle } from '../../components/auth-mode-toggle.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AuthModeToggle],
  template: `
    <div class="signup-container">
      <auth-mode-toggle></auth-mode-toggle>
      <h1>Créer mon compte</h1>
      <form [formGroup]="form" (ngSubmit)="signup()">
        <div class="form-field">
          <label>Prénom</label>
          <input formControlName="prenom" placeholder="Prénom" />
        </div>

        <div class="form-field">
          <label>Nom</label>
          <input formControlName="nom" placeholder="Nom" />
        </div>

        <div class="form-field">
          <label>Email</label>
          <input formControlName="email" type="email" placeholder="Email" />
        </div>

        <div class="form-field">
          <label>Mot de passe</label>
          <input formControlName="password" type="password" placeholder="Min 6 caractères" />
        </div>

        <div class="form-field">
          <label>Confirmer mot de passe</label>
          <input formControlName="confirmPassword" type="password" placeholder="Confirmer" />
        </div>

        <div class="form-field">
          <input type="checkbox" [checked]="agreedToCGU" (change)="agreedToCGU = $any($event.target).checked" />
          <label>J'accepte les conditions d'utilisation</label>
        </div>

        <div class="actions">
          <button type="submit">Créer mon compte</button>
          <button type="button" (click)="signupWithGoogle()"><i class="fa-brands fa-google"></i> Google</button>
        </div>
      </form>

      <div class="auth-footer">
        <p>Déjà un compte ? <a routerLink="/auth/login">Se connecter</a></p>
      </div>

      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
  styles: [
    `
      .signup-container { max-width: 520px; margin: 4rem auto; padding: 2rem; background: #fff; border-radius: 12px; }
      .form-field { margin-bottom: 1rem; }
      .actions { display: grid; gap: 1rem; }
    `
  ]
})
export class SignupComponent {
  form: ReturnType<FormBuilder['group']>;

  isLoading = false;
  error: string | null = null;
  agreedToCGU = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router
  ) {
    this.form = this.formBuilder.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  async signup(): Promise<void> {
    if (this.form.invalid || !this.agreedToCGU) {
      this.error = 'Veuillez remplir tous les champs';
      return;
    }

    const email = this.form.value.email ?? '';
    const password = this.form.value.password ?? '';
    const confirmPassword = this.form.value.confirmPassword ?? '';
    const prenom = this.form.value.prenom ?? '';
    const nom = this.form.value.nom ?? '';

    if (password !== confirmPassword) {
      this.error = 'Les mots de passe ne correspondent pas';
      return;
    }

    this.isLoading = true;
    try {
      await this.auth.signUpWithEmail(email, password, prenom, nom);
      await this.router.navigate(['/app']);
    } catch (error: any) {
      this.error = error?.message || 'Erreur lors de la création du compte';
    } finally {
      this.isLoading = false;
    }
  }

  async signupWithGoogle(): Promise<void> {
    this.isLoading = true;
    try {
      await this.auth.signInWithGoogle();
    } catch (error: any) {
      this.error = error?.message || 'Erreur Google Sign-In';
    } finally {
      this.isLoading = false;
    }
  }
}
