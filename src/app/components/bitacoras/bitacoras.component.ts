import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { LucideAngularModule, FileText, Send, Printer, Search, User, Car, CheckCircle, X } from 'lucide-angular';

@Component({
  selector: 'app-bitacoras',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LucideAngularModule],
  templateUrl: './bitacoras.component.html',
})
export class BitacorasComponent implements OnInit {
  clients: any[] = [];
  autos: any[] = [];
  services: any[] = [];
  
  selectionForm: FormGroup;
  loading = false;
  pdfGenerated = false;
  
  searchPlate = '';
  showAutoDropdown = false;
  filteredAutos: any[] = [];
  
  settings: any = {};
  showPreviewModal = false;
  previewSubject = '';
  previewBody = '';
  previewPrimaryEmail = '';
  additionalEmailsInput = '';

  readonly icons = { FileText, Send, Printer, Search, User, Car, CheckCircle, X };

  constructor(
    private api: ApiService, 
    private fb: FormBuilder,
    private notification: NotificationService
  ) {
    this.selectionForm = this.fb.group({
      clientId: ['', Validators.required],
      automobileId: [{ value: '', disabled: true }, Validators.required],
    });
  }

  ngOnInit(): void {
    this.api.getClients().subscribe(res => this.clients = res);
    this.api.getSettings().subscribe(res => this.settings = res);
  }

  onClientChange(clientId: any) {
    if (clientId) {
      this.api.getAutomobiles(clientId, undefined, true).subscribe(res => {
        this.autos = res;
        this.filteredAutos = res; // Initial list
        this.searchPlate = '';
        this.selectionForm.patchValue({ automobileId: '' });
        if (this.autos.length > 0) {
          this.selectionForm.get('automobileId')?.enable();
        } else {
          this.selectionForm.get('automobileId')?.disable();
        }
        this.services = [];
        this.pdfGenerated = false;
      });
    } else {
      this.autos = [];
      this.filteredAutos = [];
      this.services = [];
      this.selectionForm.get('automobileId')?.disable();
      this.selectionForm.patchValue({ automobileId: '' });
    }
  }

  onSearchInput() {
    this.showAutoDropdown = true;
    const term = this.searchPlate.toLowerCase().trim();
    
    if (term.length >= 2) {
      this.filteredAutos = this.autos.filter(a => 
        a.licensePlate.toLowerCase().includes(term) || 
        (a.brand && a.brand.toLowerCase().includes(term)) ||
        (a.model && a.model.toLowerCase().includes(term)) ||
        (a.submodel && a.submodel.toLowerCase().includes(term))
      );
    } else {
      this.filteredAutos = this.autos;
    }
  }

  selectAuto(auto: any) {
    this.searchPlate = `${auto.licensePlate} - ${auto.brand || ''}`;
    this.selectionForm.patchValue({ automobileId: auto.id });
    this.showAutoDropdown = false;
    this.onAutoChange(auto.id);
  }

  onAutoChange(autoId: any) {
    if (autoId) {
      this.api.getServices({ automobileId: autoId }).subscribe(res => {
        this.services = res;
        this.pdfGenerated = false;
      });
    } else {
      this.services = [];
    }
  }

  openEmailPreview() {
    const autoId = this.selectionForm.get('automobileId')?.value;
    if (!autoId) return;

    const automobile = this.autos.find(a => a.id === parseInt(autoId));
    if (!automobile) return;

    const client = this.clients.find(c => c.id === automobile.clientId);
    this.previewPrimaryEmail = client?.email || 'Sin correo registrado';

    const rawSubject = this.settings.email_subject || `Bitácora de Servicios - {{vehiculo}}`;
    this.previewSubject = rawSubject.replace('{{vehiculo}}', automobile.licensePlate);

    const rawBody = this.settings.email_body || `Hola {{cliente}},\n\nAdjuntamos la bitácora de servicios para su vehículo con placas {{vehiculo}}.\n\nSaludos.`;
    this.previewBody = rawBody.replace('{{cliente}}', client?.name || '').replace('{{vehiculo}}', automobile.licensePlate);

    this.additionalEmailsInput = '';
    this.showPreviewModal = true;
  }

  confirmSendEmail() {
    const autoId = this.selectionForm.get('automobileId')?.value;
    if (!autoId) return;

    this.loading = true;
    this.showPreviewModal = false;
    this.api.generateBitacora(autoId, true, this.additionalEmailsInput).subscribe({
      next: (res) => {
        this.loading = false;
        this.notification.show('Bitácora enviada por correo electrónico', 'success');
      },
      error: (err: any) => {
        this.loading = false;
        this.notification.show('Error al enviar la bitácora: ' + (err.error?.error || 'Desconocido'), 'error');
      }
    });
  }

  generatePdf() {
    const autoId = this.selectionForm.get('automobileId')?.value;
    if (!autoId) return;

    this.loading = true;
    this.api.generateBitacora(autoId, false).subscribe({
      next: (res) => {
        this.loading = false;
        // Preview/Print PDF in new window (Opening window immediately to avoid popup blockers)
        const newWindow = window.open('', '_blank');
        
        try {
          const byteCharacters = atob(res.pdf);
          const byteNumbers = new Uint8Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const blob = new Blob([byteNumbers], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          
          if (newWindow) {
            newWindow.location.href = blobUrl;
          } else {
            // Fallback to download if still blocked
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `Bitacora_${autoId}.pdf`;
            link.click();
          }
        } catch (e) {
          console.error('Error creating PDF preview', e);
          alert('Error al generar la vista previa. Intentando descargar el archivo...');
          const link = document.createElement('a');
          link.href = `data:application/pdf;base64,${res.pdf}`;
          link.download = `Bitacora_${autoId}.pdf`;
          link.click();
        }
        this.pdfGenerated = true;
      },
      error: (err: any) => {
        this.loading = false;
        this.notification.show('Error al generar la bitácora: ' + (err.error?.error || 'Desconocido'), 'error');
      }
    });
  }
}
