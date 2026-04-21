import { Routes } from '@angular/router';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ClientsComponent } from './components/clients/clients.component';
import { AutomobilesComponent } from './components/automobiles/automobiles.component';
import { ServicesComponent } from './components/services/services.component';
import { BitacorasComponent } from './components/bitacoras/bitacoras.component';
import { SettingsComponent } from './components/settings/settings.component';
import { LayoutComponent } from './components/layout.component';
import { LoginComponent } from './components/login/login.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'automobiles', component: AutomobilesComponent },
      { path: 'services', component: ServicesComponent },
      { path: 'bitacoras', component: BitacorasComponent },
      { path: 'settings', component: SettingsComponent },
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
