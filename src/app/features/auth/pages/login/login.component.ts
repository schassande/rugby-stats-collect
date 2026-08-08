import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthMode, AuthService } from '@core/services/auth.service';
import { AuthModeToggle } from '../../components/auth-mode-toggle.component';
import { LocalUser } from '@core/db/rugby-stats.database';
import { CheckboxModule } from 'primeng/checkbox';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { PanelModule } from 'primeng/panel';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AuthModeToggle,
    CheckboxModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    PanelModule,
  ],
  template: `
    <div class="login-container">
      <h1>Connexion à l'application</h1>
      <auth-mode-toggle [(mode)]="localAuth"></auth-mode-toggle>
      <div style="height: 20px;"></div>
      @if (localAuth() == 'local') {
        <p class="local-users">Liste des utilisateurs locaux :</p>
        @for (localUser of localUsers() | async; track localUser.id) {
          <div class="local-user">
            <div class="local-user-name" (click)="localSignIn(localUser)">
              {{ localUser.prenom }} {{ localUser.nom }}
            </div>
            <div class="local-user-delete" (click)="deleteLocalUser(localUser)">
              <i class="fa fa-trash" aria-hidden="true"></i>
            </div>
          </div>
        } @empty {
          <p>
            Aucun utilisateur local. Connectez vous une première fois en ligne pour que votre compte
            soit disponible hors ligne.
          </p>
        }
        <div class="auto-login">
          <label>
            <p-checkbox
              inputId="auto-login-local"
              [binary]="true"
              [(ngModel)]="autoLoginLocal"
              (ngModelChange)="setAutoLoginLocal($event)"
            />
            Se connecter automatiquement
          </label>
        </div>
      } @else {
        <p-button
          class="google-login"
          type="button"
          label="Google"
          icon="pi pi-google"
          (onClick)="loginWithGoogle()"
          severity="secondary"
        />
        <div class="login-separator" aria-hidden="true"><span>OU</span></div>
        <p-panel class="login-panel">
          <form [formGroup]="form" (ngSubmit)="login()">
            <div class="form-field">
              <label for="email">Email</label>
              <input
                pInputText
                id="email"
                formControlName="email"
                type="email"
                placeholder="Email"
                autocomplete="username"
              />
            </div>

            <div class="form-field">
              <label for="password">Mot de passe</label>
              <p-password
                formControlName="password"
                placeholder="Mot de passe"
                autocomplete="current-password"
                [feedback]="false"
              />
            </div>

            <div class="actions">
              <p-button type="submit" label="Connexion" />
            </div>
          </form>

          <div class="auth-footer">
            <p>
              <a href="/auth/reset-password" (click)="openPasswordReset($event)"
                >Réinitialiser son mot de passe</a
              >
            </p>
            <p>Pas encore de compte ? <a routerLink="/auth/signup">Créer un compte</a></p>
          </div>
        </p-panel>
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
        margin-top: 20px;
        margin-bottom: 20px;
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
        display: grid;
        grid-template-columns: 110px minmax(0, 1fr);
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 1rem;
      }
      .form-field input {
        width: 100%;
        min-width: 0;
      }

      :host ::ng-deep .form-field p-password,
      :host ::ng-deep .form-field p-password .p-password,
      :host ::ng-deep .form-field p-password input {
        display: block;
        width: 100%;
      }

      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }

      .google-login {
        display: block;
        width: 100%;
      }

      :host ::ng-deep .google-login button {
        width: 100%;
      }

      .login-panel {
        display: block;
        margin-top: 1rem;
      }

      .auth-footer {
        margin-top: 1.25rem;
      }

      :host ::ng-deep .login-panel .p-panel-title {
        width: 100%;
        text-align: center;
      }

      .login-separator {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        margin: 1rem 0;
        color: #6b7280;
        font-size: 0.85rem;
      }

      .login-separator::before,
      .login-separator::after {
        content: '';
        flex: 1;
        border-top: 1px solid #d1d5db;
      }
      .auto-login {
        margin: 30px auto 0 auto;
        text-align: right;
      }
    `,
  ],
})
export class LoginComponent {
  form: ReturnType<FormBuilder['group']>;
  error: string | null = null;
  private readonly returnUrl: string;
  protected localAuth = signal<AuthMode>('local');
  protected autoLoginLocal = signal(false);
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
    private readonly route: ActivatedRoute,
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/app';
    this.autoLoginLocal.set(this.auth.isAutoLoginLocalEnabled());
    this.form = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
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
    await this.auth.loginLocal(localUser);
    await this.router.navigate([this.returnUrl]);
  }

  setAutoLoginLocal(enabled: boolean): void {
    this.auth.setAutoLoginLocalEnabled(enabled);
    this.autoLoginLocal.set(enabled);
  }

  deleteLocalUser(localUser: LocalUser) {
    this.auth.deleteLocalUser(localUser.id);
    this.localAuth.set(this.localAuth());
  }

  /** Ouvre la page de réinitialisation avec l'adresse éventuellement saisie. */
  async openPasswordReset(event: Event): Promise<void> {
    event.preventDefault();
    await this.router.navigate(['/auth/reset-password'], {
      queryParams: { email: this.form.controls['email'].value ?? undefined },
    });
  }
}
