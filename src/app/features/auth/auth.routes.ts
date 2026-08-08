import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { PasswordResetComponent } from './pages/password-reset/password-reset.component';

export const AUTH_ROUTES: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'reset-password', component: PasswordResetComponent },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];
