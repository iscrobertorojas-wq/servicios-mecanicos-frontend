import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  public apiUrl = ''; // Set dynamically in constructor

  constructor(private http: HttpClient) {
    const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
    
    if (hostname.includes('vercel.app')) {
      // SI ESTAMOS EN VERCEL: Forzamos la URL de producción con HTTPS
      this.apiUrl = 'https://servicios-mecanicos-backend-production.up.railway.app/api';
    } else if (environment.apiUrl) {
      // Si el environment sí funcionó y tiene URL
      this.apiUrl = environment.apiUrl;
    } else {
      // DESARROLLO LOCAL / LAN
      this.apiUrl = `http://${hostname}:3000/api`;
    }
  }

  // Dashboard
  getStats(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard`);
  }

  // Clients
  getClients(q?: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clients${q ? '?q=' + q : ''}`);
  }

  createClient(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients`, data);
  }

  updateClient(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/clients/${id}`, data);
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clients/${id}`);
  }

  // Automobiles
  getAutomobiles(clientId?: any, q?: string, hasServices: boolean = false): Observable<any[]> {
    let url = `${this.apiUrl}/automobiles?`;
    if (clientId) url += `clientId=${clientId}&`;
    if (q) url += `q=${q}&`;
    if (hasServices) url += `hasServices=true`;
    return this.http.get<any[]>(url);
  }

  createAutomobile(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/automobiles`, data);
  }

  updateAutomobile(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/automobiles/${id}`, data);
  }

  deleteAutomobile(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/automobiles/${id}`);
  }

  // Services
  getServices(filters: any): Observable<any[]> {
    let params = new URLSearchParams();
    Object.keys(filters).forEach(key => {
      if (filters[key]) params.append(key, filters[key]);
    });
    return this.http.get<any[]>(`${this.apiUrl}/services?${params.toString()}`);
  }

  createService(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/services`, data);
  }

  updateService(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/services/${id}`, data);
  }

  deleteService(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/services/${id}`);
  }

  // Bitacora
  generateBitacora(automobileId: number, sendEmail: boolean = false, additionalEmails?: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/bitacora/generate`, { automobileId, sendEmail, additionalEmails });
  }

  // Settings
  getSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/settings`);
  }

  saveSettings(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/settings`, data);
  }

  getAuthGoogleUrl(): string {
    // apiUrl is like "http://hostname:3000/api"
    // we want "http://hostname:3000/api/auth/google"
    return `${this.apiUrl}/auth/google`;
  }

  downloadBackup(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/backup`, { responseType: 'blob' });
  }
}
