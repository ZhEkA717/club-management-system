import { inject, Injectable } from '@angular/core';
import { catchError, map, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { IGeneralResponse, User } from '@/pages/auth/login';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private httpClient = inject(HttpClient);
  private router = inject(Router);

  // Авторизация
  login(email: string, password: string) {
    return this.httpClient
      .post<
        IGeneralResponse<{
          user: User;
          token: string;
        }>
      >('http://localhost:8000/server/api/auth/login', {
        email,
        password,
      })
      .pipe(
        map(({ data }) => {
          if (!data) return null;
          return data;
        }),
        tap((data) => {
          if (data?.token) {
            this.setToken(data.token);
          }
        }),
        catchError(() => of(null)),
      );
  }

  registration(email: string, firstName: string, lastName: string, password: string) {
      this.httpClient
          .post<
              IGeneralResponse<{
                  user: User;
                  token: string;
              }>
          >('http://localhost:8000/server/api/auth/login', {
              email,
              firstName,
              lastName,
              password,
          })
          .pipe(
              map(({ data }) => {
                  if (!data) return null;
                  return data;
              }),
              tap((data) => {
                  if(data?.token) {
                      this.setToken(data.token)
                  }
              }),
              catchError(() => of(null)),
          )
  }

  // Сохранить токен
  setToken(token: string): void {
    localStorage.setItem('token', token);
  }

  // Получить токен
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Проверка авторизован ли
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  // Выйти
  logout(): void {
    localStorage.removeItem('token');
  }
}
