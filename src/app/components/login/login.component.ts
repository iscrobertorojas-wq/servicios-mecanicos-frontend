import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { LucideAngularModule, LogIn, User, Lock, AlertCircle, Eye, EyeOff } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  template: `
    <div class="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div class="max-w-md w-full bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-700">
        <div class="p-8 text-center bg-slate-800/50 border-b border-slate-700">
          <div class="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white shadow-lg shadow-blue-500/20">
            <lucide-angular [img]="LogInIcon" class="w-8 h-8"></lucide-angular>
          </div>
          <h1 class="text-2xl font-bold text-white tracking-tight">Bienvenido de nuevo</h1>
          <p class="text-slate-400 mt-1">Inicia sesión para gestionar los servicios</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="p-8 space-y-6">
          <div *ngIf="error" class="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <lucide-angular [img]="AlertIcon" class="w-5 h-5 shrink-0 mt-0.5"></lucide-angular>
            <p class="text-sm font-medium">{{ error }}</p>
          </div>

          <div class="space-y-4">
            <div>
              <label for="username" class="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">Usuario</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <lucide-angular [img]="UserIcon" class="w-5 h-5"></lucide-angular>
                </div>
                <input
                  id="username"
                  formControlName="username"
                  type="text"
                  placeholder="Admin"
                  class="block w-full pl-11 pr-4 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                >
              </div>
            </div>

            <div>
              <label for="password" class="block text-sm font-semibold text-slate-300 mb-1.5 ml-1">Contraseña</label>
              <div class="relative group">
                <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-500 transition-colors">
                  <lucide-angular [img]="LockIcon" class="w-5 h-5"></lucide-angular>
                </div>
                <input
                  id="password"
                  formControlName="password"
                  [type]="showPassword ? 'text' : 'password'"
                  placeholder="••••••••"
                  class="block w-full pl-11 pr-12 py-3 bg-slate-900/50 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all placeholder:text-slate-600"
                >
                <button
                  type="button"
                  (click)="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-white transition-colors"
                >
                  <lucide-angular [img]="showPassword ? EyeOffIcon : EyeIcon" class="w-5 h-5"></lucide-angular>
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            [disabled]="loginForm.invalid || loading"
            class="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
          >
            <span *ngIf="!loading">Ingresar al Sistema</span>
            <span *ngIf="loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Cargando...
            </span>
          </button>
        </form>

        <div class="p-6 bg-slate-900/20 text-center border-t border-slate-700/50">
          <p class="text-xs text-slate-500 uppercase tracking-widest font-bold">Servicios Mecánicos Paco</p>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup;
  loading = false;
  showPassword = false;
  error = '';

  readonly LogInIcon = LogIn;
  readonly UserIcon = User;
  readonly LockIcon = Lock;
  readonly AlertIcon = AlertCircle;
  readonly EyeIcon = Eye;
  readonly EyeOffIcon = EyeOff;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  onSubmit() {
    if (this.loginForm.invalid) return;

    this.loading = true;
    this.error = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = 'Usuario o contraseña incorrectos';
      }
    });
  }
}
