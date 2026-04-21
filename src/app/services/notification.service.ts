import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface ConfirmDialog {
  message: string;
  resolve: (value: boolean) => void;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationsSource = new BehaviorSubject<Notification[]>([]);
  notifications$ = this.notificationsSource.asObservable();

  private confirmSource = new Subject<ConfirmDialog | null>();
  confirm$ = this.confirmSource.asObservable();

  private idCounter = 0;

  show(message: string, type: Notification['type'] = 'info', duration: number = 5000) {
    const id = this.idCounter++;
    const notification: Notification = { id, message, type, duration };
    
    const current = this.notificationsSource.value;
    this.notificationsSource.next([...current, notification]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(message: string) { this.show(message, 'success'); }
  error(message: string) { this.show(message, 'error'); }
  warning(message: string) { this.show(message, 'warning'); }
  info(message: string) { this.show(message, 'info'); }

  remove(id: number) {
    const current = this.notificationsSource.value;
    this.notificationsSource.next(current.filter(n => n.id !== id));
  }

  confirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.confirmSource.next({ message, resolve: (val) => {
        this.confirmSource.next(null);
        resolve(val);
      }});
    });
  }
}
