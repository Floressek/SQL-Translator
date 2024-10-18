import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { MainPageComponent } from './pages/main-page/main-page.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';

export const routes: Routes = [
  { path: '', component: MainPageComponent, canActivate: [authGuard] },
  { path: 'auth/login', component: LoginPageComponent },
  { path: '**', redirectTo: '' },
];
