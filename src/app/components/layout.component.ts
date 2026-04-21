import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { 
  LayoutDashboard, 
  Users, 
  Car, 
  Wrench, 
  FileText, 
  Settings, 
  Search, 
  Bell, 
  UserCircle,
  Menu,
  LogOut,
  X
} from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { NotificationComponent } from './notification.component';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, NotificationComponent],
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  sidebarOpen = true;
  private authService = inject(AuthService);

  readonly icons = {
    Dashboard: LayoutDashboard,
    Clients: Users,
    Automobiles: Car,
    Services: Wrench,
    Wrench: Wrench,
    Bitacoras: FileText,
    Settings: Settings,
    Search: Search,
    Bell: Bell,
    UserCircle: UserCircle,
    Menu: Menu,
    LogOut: LogOut,
    X: X
  };

  navItems = [
    { label: 'Dashboard', route: '/dashboard', icon: this.icons.Dashboard },
    { label: 'Clientes', route: '/clients', icon: this.icons.Clients },
    { label: 'Automóviles', route: '/automobiles', icon: this.icons.Automobiles },
    { label: 'Servicios', route: '/services', icon: this.icons.Services },
    { label: 'Bitácoras', route: '/bitacoras', icon: this.icons.Bitacoras },
    { label: 'Configuración', route: '/settings', icon: this.icons.Settings },
  ];

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  logout() {
    this.authService.logout();
  }
}
