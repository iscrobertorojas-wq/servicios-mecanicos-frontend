import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { LucideAngularModule, Settings, Save, Mail, Lock, Server, Smartphone, Check, FileImage, Type, Key, FileText } from 'lucide-angular';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './settings.component.html',
})
export class SettingsComponent implements OnInit {
  settingsForm: FormGroup;
  loading = false;
  saved = false;

  readonly icons = { Settings, Save, Mail, Lock, Server, Smartphone, Check, FileImage, Type, Key, FileText };

  constructor(private api: ApiService, private fb: FormBuilder, private route: ActivatedRoute) {
    this.settingsForm = this.fb.group({
      smtp_host: [''],
      smtp_port: [587],
      smtp_user: ['', [Validators.email]],
      smtp_pass: [''],
      smtp_from: ['', Validators.email],
      smtp_secure: ['false'],
      smtp_client_id: [''],
      smtp_client_secret: [''],
      smtp_refresh_token: [''],
      email_subject: [''],
      email_body: [''],
      pdf_header: [''],
      pdf_logo_left: [''],
      pdf_logo_right: [''],
      frontend_url: [typeof window !== 'undefined' ? window.location.origin : '']
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['googleAuth'] === 'success') {
        alert('¡Cuenta de Google vinculada exitosamente!');
      } else if (params['googleAuth'] === 'error') {
        const desc = params['desc'] ? `\n\nDetalle técnico: ${params['desc']}` : '';
        alert('Hubo un error vinculando la cuenta de Google. Verifica que copiaste todo tu Client ID y Client Secret tal cual, sin espacios al inicio o al final.' + desc);
      }
    });

    this.api.getSettings().subscribe({
      next: (res) => {
        if (Object.keys(res).length > 0) {
          this.settingsForm.patchValue(res);
        }
      },
      error: (err) => console.error(err)
    });
  }

  connectWithGoogle() {
    const { smtp_client_id, smtp_client_secret } = this.settingsForm.value;
    
    if (!smtp_client_id || !smtp_client_secret) {
      alert('Primero debes escribir el Client ID y Client Secret para continuar.');
      return;
    }
    
    this.loading = true;
    
    // Auto-save the credentials before redirecting so the backend has them ready.
    this.api.saveSettings(this.settingsForm.value).subscribe({
      next: () => {
        this.loading = false;
        window.location.href = this.api.getAuthGoogleUrl();
      },
      error: () => {
        this.loading = false;
        alert('Error al guardar credenciales antes de conectar.');
      }
    });
  }

  onFileSelected(event: any, field: string) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.settingsForm.patchValue({ [field]: reader.result });
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.settingsForm.invalid) {
      console.warn('Formulario inválido:', this.getFormValidationErrors());
      alert('Por favor, verifique que los correos electrónicos tengan un formato válido.');
      return;
    }

    this.loading = true;
    const values = {
      ...this.settingsForm.value,
      frontend_url: typeof window !== 'undefined' ? window.location.origin : ''
    };
    console.log('Guardando configuración...', values);
    this.api.saveSettings(values).subscribe({
      next: () => {
        this.loading = false;
        this.saved = true;
        setTimeout(() => this.saved = false, 3000);
      },
      error: (err) => {
        this.loading = false;
        alert('Error al guardar la configuración');
      }
    });
  }

  private getFormValidationErrors() {
    const errors: any = {};
    Object.keys(this.settingsForm.controls).forEach(key => {
      const controlErrors = this.settingsForm.get(key)?.errors;
      if (controlErrors) errors[key] = controlErrors;
    });
    return errors;
  }
}
