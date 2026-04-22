import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = '';
  private http = inject(HttpClient);
  private router = inject(Router);

  constructor() {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    
    if (hostname.includes('vercel.app')) {
      // SI ESTAMOS EN VERCEL: Usar la URL de Railway con HTTPS
      this.apiUrl = 'https://servicios-mecanicos-backend-production.up.railway.app/api/auth';
    } else {
      // DESARROLLO LOCAL / LAN
      this.apiUrl = `http://${hostname}:3000/api/auth`;
    }
  }

  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          localStorage.setItem('auth_token', res.token);
        }
      })
    );
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
