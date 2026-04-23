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

  private timeoutId: any;
  private readonly INACTIVITY_TIME = 3600000; // 1 hora en milisegundos

  constructor() {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    
    if (hostname.includes('vercel.app')) {
      this.apiUrl = 'https://servicios-mecanicos-backend-production.up.railway.app/api/auth';
    } else {
      this.apiUrl = `http://${hostname}:3000/api/auth`;
    }

    if (typeof window !== 'undefined') {
      this.initInactivityTimer();
    }
  }

  private initInactivityTimer() {
    // Escuchar eventos de actividad
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, () => this.resetInactivityTimer());
    });
    this.resetInactivityTimer();
  }

  private resetInactivityTimer() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
    
    if (this.isLoggedIn()) {
      this.timeoutId = setTimeout(() => {
        console.log('Sesión cerrada por inactividad');
        this.logout();
      }, this.INACTIVITY_TIME);
    }
  }

  login(credentials: { username: string, password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials).pipe(
      tap((res: any) => {
        if (res.token) {
          sessionStorage.setItem('auth_token', res.token);
          this.resetInactivityTimer();
        }
      })
    );
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('auth_token');
    }
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem('auth_token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
