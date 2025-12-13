import { Routes } from '@angular/router';
import { Access } from './access';
import { Login } from './login';
import { Error } from './error';
import { Registration } from '@/pages/auth/registration';
import { ConfirmationService } from 'primeng/api';

export default [
  { path: 'access', component: Access },
  { path: 'error', component: Error },
  { path: 'login', component: Login, providers: [ConfirmationService] },
  { path: 'registration', component: Registration },
] as Routes;
