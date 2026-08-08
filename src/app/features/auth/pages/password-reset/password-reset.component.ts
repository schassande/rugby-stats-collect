import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PanelModule } from 'primeng/panel';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-password-reset',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    ButtonModule,
    InputTextModule,
    PanelModule,
  ],
  template: `
    <div class="password-reset-container">
      <p-panel header="Réinitialiser son mot de passe">
        <p>Indiquez l'adresse e-mail associée à votre compte.</p>
        <form [formGroup]="form" (ngSubmit)="requestReset()">
          <div class="form-field">
            <label for="email">Email</label>
            <input
              pInputText
              id="email"
              formControlName="email"
              type="email"
              autocomplete="email"
            />
          </div>
          <div class="actions">
            <p-button type="button" label="Annuler" severity="secondary" routerLink="/auth/login" />
            <p-button type="submit" label="Demander la réinitialisation" [loading]="isLoading()" />
          </div>
        </form>
        @if (message()) {
          <p class="success">{{ message() }}</p>
        }
        @if (error()) {
          <p class="error">{{ error() }}</p>
        }
      </p-panel>
    </div>
  `,
  styles: [
    `
      .password-reset-container {
        max-width: 520px;
        width: calc(100% - 2rem);
        margin: 4rem auto;
      }
      .form-field {
        display: grid;
        gap: 0.5rem;
        margin: 1.5rem 0;
      }
      .form-field input {
        width: 100%;
      }
      .actions {
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
        flex-wrap: wrap;
      }
      .success {
        color: #166534;
      }
      .error {
        color: #b91c1c;
      }
    `,
  ],
})
export class PasswordResetComponent {
  readonly form: ReturnType<FormBuilder['group']>;
  readonly isLoading = signal(false);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  constructor(
    formBuilder: FormBuilder,
    private readonly auth: AuthService,
    route: ActivatedRoute,
  ) {
    this.form = formBuilder.group({
      email: [
        route.snapshot.queryParamMap.get('email') ?? '',
        [Validators.required, Validators.email],
      ],
    });
  }

  /** Envoie la demande de réinitialisation à Firebase. */
  async requestReset(): Promise<void> {
    this.message.set(null);
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Veuillez saisir une adresse e-mail valide.');
      return;
    }
    this.isLoading.set(true);
    try {
      await this.auth.requestPasswordReset(this.form.controls['email'].value ?? '');
      this.message.set('Un e-mail de réinitialisation vient de vous être envoyé.');
    } catch (error: any) {
      this.error.set(
        error?.code === 'auth/user-not-found'
          ? 'Aucun compte ne correspond à cette adresse e-mail.'
          : 'Impossible d’envoyer la demande de réinitialisation.',
      );
    } finally {
      this.isLoading.set(false);
    }
  }
}
