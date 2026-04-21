import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../services/notification.service';
import { LucideAngularModule, CheckCircle, AlertTriangle, XCircle, Info, X, AlertCircle } from 'lucide-angular';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <!-- Toasts Container -->
    <div class="fixed top-6 right-6 z-[100] flex flex-col gap-4 pointer-events-none w-full max-w-sm">
      <div *ngFor="let n of notifications$ | async" 
        class="pointer-events-auto flex items-center gap-4 p-4 rounded-2xl shadow-2xl border animate-in slide-in-from-right duration-300"
        [ngClass]="{
          'bg-emerald-50 border-emerald-200 text-emerald-800': n.type === 'success',
          'bg-red-50 border-red-200 text-red-800': n.type === 'error',
          'bg-amber-50 border-amber-200 text-amber-800': n.type === 'warning',
          'bg-blue-50 border-blue-200 text-blue-800': n.type === 'info'
        }"
      >
        <lucide-angular [img]="getIcon(n.type)" [class]="'w-6 h-6 ' + getIconClass(n.type)"></lucide-angular>
        <p class="flex-1 text-sm font-medium">{{ n.message }}</p>
        <button (click)="remove(n.id)" class="p-1 hover:bg-black/5 rounded-full transition-colors">
          <lucide-angular [img]="icons.X" class="w-4 h-4"></lucide-angular>
        </button>
      </div>
    </div>

    <!-- Confirm Modal -->
    <div *ngIf="confirm$ | async as dialog" class="fixed inset-0 z-[110] flex items-center justify-center p-6 sm:p-0">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"></div>
      
      <div class="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div class="p-8">
          <div class="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mb-6">
            <lucide-angular [img]="icons.AlertCircle" class="w-8 h-8 text-red-600"></lucide-angular>
          </div>
          
          <h3 class="text-xl font-bold text-slate-900 mb-2">¿Estás seguro?</h3>
          <p class="text-slate-500">{{ dialog.message }}</p>
        </div>
        
        <div class="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <button 
            (click)="dialog.resolve(false)" 
            class="flex-1 px-6 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
          >
            Cancelar
          </button>
          <button 
            (click)="dialog.resolve(true)" 
            class="flex-1 px-6 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all hover:-translate-y-0.5"
          >
            Confirmar Eliminar
          </button>
        </div>
      </div>
    </div>
  `
})
export class NotificationComponent {
  private ns = inject(NotificationService);
  notifications$ = this.ns.notifications$;
  confirm$ = this.ns.confirm$;

  readonly icons = { CheckCircle, AlertTriangle, XCircle, Info, X, AlertCircle };

  getIcon(type: string) {
    switch (type) {
      case 'success': return this.icons.CheckCircle;
      case 'error': return this.icons.XCircle;
      case 'warning': return this.icons.AlertTriangle;
      default: return this.icons.Info;
    }
  }

  getIconClass(type: string) {
    switch (type) {
      case 'success': return 'text-emerald-600';
      case 'error': return 'text-red-600';
      case 'warning': return 'text-amber-600';
      default: return 'text-blue-600';
    }
  }

  remove(id: number) {
    this.ns.remove(id);
  }
}
