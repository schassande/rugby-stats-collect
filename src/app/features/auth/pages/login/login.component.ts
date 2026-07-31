import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthMode, AuthService } from '@core/services/auth.service';
import { AuthModeToggle } from '../../components/auth-mode-toggle.component';
import { LocalUser } from '@core/db/rugby-stats.database';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AuthModeToggle],
  template: `
    <div class="login-container">
      <auth-mode-toggle [(mode)]="localAuth"></auth-mode-toggle>
      @if (localAuth() == 'local') {
        <p class="local-users">Liste des utilisateurs locaux :</p>
        @for(localUser of localUsers() | async; track localUser.id) {
          <div  class="local-user">
            <div class="local-user-name" (click)="localSignIn(localUser)">{{localUser.prenom}} {{localUser.nom}}</div>
            <div class="local-user-delete" (click)="deleteLocalUser(localUser)"><i class="fa fa-trash" aria-hidden="true"></i></div>
          </div>
        } @empty {
          <p>Aucun utilisateur local. Connectez vous une première fois en ligne pour que votre compte soit disponible hors ligne.</p>
        }
      } @else {
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
      }

      <div *ngIf="error" class="error">{{ error }}</div>
    </div>
  `,
  styles: [
    `
      .login-container {
        max-width: 420px;
        width: calc(100% - 2rem);
        margin: 1rem auto;
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
      .local-users {
        margin-top: 50px;
        margin-bottom: 20px;
        text-align: center;
      }
      .local-user {
        border: 1px solid black;
        text-align: center;
      }
      .local-user-name {
        padding: 10px;
        min-width: 300px;
        display: inline-block;
      }
      .local-user-delete {
        margin: 10px;
        vertical-align: middle;
        display: inline-block;
        float: right;
      }
      .form-field {
        margin-bottom: 1rem;
      }
      .form-field input {
        display: block;
        width: 100%;
        min-width: 0;
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
  protected localAuth = signal<AuthMode>('local');
  protected localUsers = computed(async () => {
    if (this.localAuth() === 'local') {
      return await this.auth.getLocalUsers();
    } else {
      return [];
    }
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    protected readonly auth: AuthService,
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

  async localSignIn(localUser: LocalUser): Promise<void> {
    this.auth.loginLocal(localUser);
    await this.router.navigate([this.returnUrl]);
  }

  deleteLocalUser(localUser: LocalUser) {
    this.auth.deleteLocalUser(localUser.id);
    this.localAuth.set(this.localAuth());
  }
}
