import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { 
  LucideAngularModule, 
  FileText, 
  Send, 
  Printer, 
  Search, 
  User, 
  Car, 
  CheckCircle, 
  X,
  QrCode,
  MessageCircle,
  Share2,
  Copy,
  ExternalLink,
  Check,
  Download,
  AlertCircle,
  Phone
} from 'lucide-angular';

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

  // Label State
  showLabelModal = false;
  labelLoading = false;
  labelPdfBase64 = '';
  labelQrUrl = '';
  labelQrDataUrl = '';
  labelAuto: any = null;
  labelHeader = '';
  labelLogo = '';
  copiedLabelLink = false;

  // WhatsApp State
  showWhatsAppModal = false;
  whatsAppLoading = false;
  whatsAppPhone = '';
  whatsAppMessage = '';
  whatsAppAuto: any = null;
  whatsAppClient: any = null;
  whatsAppPublicUrl = '';
  whatsAppPdfUrl = '';
  isMobileDevice = false;

  readonly icons = { 
    FileText, 
    Send, 
    Printer, 
    Search, 
    User, 
    Car, 
    CheckCircle, 
    X,
    QrCode,
    MessageCircle,
    Share2,
    Copy,
    ExternalLink,
    Check,
    Download,
    AlertCircle,
    Phone
  };

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
    this.isMobileDevice = typeof window !== 'undefined' && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
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

  getSelectedAuto(): any {
    const autoId = this.selectionForm.get('automobileId')?.value;
    if (!autoId) return null;
    return this.autos.find(a => a.id === parseInt(autoId));
  }

  getSelectedClient(): any {
    const auto = this.getSelectedAuto();
    if (!auto) return null;
    return this.clients.find(c => c.id === auto.clientId);
  }

  // --- LABEL FEATURE (Option 1) ---
  openLabelModal() {
    const automobile = this.getSelectedAuto();
    if (!automobile) return;

    this.labelAuto = automobile;
    this.labelLoading = true;
    this.showLabelModal = true;
    this.copiedLabelLink = false;

    const frontendUrl = typeof window !== 'undefined' ? window.location.origin : '';

    this.api.generateBitacoraLabel(automobile.id, frontendUrl).subscribe({
      next: (res) => {
        this.labelLoading = false;
        this.labelPdfBase64 = res.pdf;
        this.labelQrUrl = res.qrUrl;
        this.labelQrDataUrl = res.qrDataUrl;
        this.labelHeader = res.headerTitle;
        this.labelLogo = res.logo || this.settings.pdf_logo_left;
      },
      error: (err) => {
        this.labelLoading = false;
        this.notification.show('Error al generar la etiqueta: ' + (err.error?.error || 'Desconocido'), 'error');
      }
    });
  }

  printLabel() {
    if (!this.labelQrDataUrl || !this.labelAuto) return;
    
    // Direct print using invisible iframe
    const printFrame = document.createElement('iframe');
    printFrame.style.position = 'fixed';
    printFrame.style.right = '0';
    printFrame.style.bottom = '0';
    printFrame.style.width = '0';
    printFrame.style.height = '0';
    printFrame.style.border = '0';
    document.body.appendChild(printFrame);

    const doc = printFrame.contentWindow?.document;
    if (doc) {
      const vehicleDetails = [this.labelAuto.brand, this.labelAuto.submodel, this.labelAuto.model].filter(Boolean).join(' ');
      doc.open();
      doc.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Etiqueta - ${this.labelAuto.licensePlate}</title>
          <style>
            @page {
              size: 95mm 48mm;
              margin: 0;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              width: 95mm;
              height: 48mm;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: Arial, Helvetica, sans-serif;
              background: #fff;
              color: #000;
            }
            .label-container {
              width: 91mm;
              height: 44mm;
              border: 1.5px solid #000;
              padding: 2.5mm 3.5mm;
              display: flex;
              justify-content: space-between;
              align-items: stretch;
            }
            .left-col {
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              width: 52mm;
            }
            .header-row {
              display: flex;
              align-items: center;
              gap: 2mm;
            }
            .logo {
              width: 10mm;
              height: 10mm;
              object-fit: contain;
            }
            .header-title {
              font-size: 7.5pt;
              font-weight: bold;
              text-transform: uppercase;
              line-height: 1.15;
            }
            .middle-info {
              margin: auto 0;
            }
            .plate {
              font-size: 15pt;
              font-weight: 900;
              font-family: monospace;
              line-height: 1.1;
            }
            .vehicle {
              font-size: 9.5pt;
              font-weight: bold;
              text-transform: uppercase;
              line-height: 1.15;
              margin-top: 1mm;
            }
            .legend {
              font-size: 6pt;
              color: #333;
            }
            .right-col {
              width: 33mm;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .qr-img {
              width: 33mm;
              height: 33mm;
              object-fit: contain;
            }
          </style>
        </head>
        <body>
          <div class="label-container">
            <div class="left-col">
              <div class="header-row">
                ${this.labelLogo ? `<img src="${this.labelLogo}" class="logo" />` : ''}
                <div class="header-title">${this.labelHeader || 'LLANTAS Y SERVICIOS DE JALPA'}</div>
              </div>
              <div class="middle-info">
                <div class="plate">${this.labelAuto.licensePlate}</div>
                <div class="vehicle">${vehicleDetails}</div>
              </div>
              <div class="legend">escanear para ver bitacora de servicios</div>
            </div>
            <div class="right-col">
              <img src="${this.labelQrDataUrl}" class="qr-img" />
            </div>
          </div>
        </body>
        </html>
      `);
      doc.close();
      setTimeout(() => {
        printFrame.contentWindow?.focus();
        printFrame.contentWindow?.print();
        setTimeout(() => {
          if (document.body.contains(printFrame)) {
            document.body.removeChild(printFrame);
          }
        }, 4000);
      }, 350);
    }
  }

  copyLabelQrLink() {
    if (!this.labelQrUrl) return;
    navigator.clipboard.writeText(this.labelQrUrl).then(() => {
      this.copiedLabelLink = true;
      setTimeout(() => this.copiedLabelLink = false, 2500);
      this.notification.show('Enlace copiado al portapapeles', 'success');
    }).catch(err => {
      console.error('Error copying to clipboard', err);
    });
  }

  // --- WHATSAPP FEATURE (Option 2) ---
  openWhatsAppModal() {
    const automobile = this.getSelectedAuto();
    if (!automobile) return;

    const client = this.getSelectedClient();
    this.whatsAppAuto = automobile;
    this.whatsAppClient = client;

    // Format phone: strip spaces, dashes, symbols
    let rawPhone = (client?.phone || '').trim();
    let digitsOnly = rawPhone.replace(/\D/g, '');

    // Format for WhatsApp: if Mexican 10 digits without country code, prepend 52
    if (digitsOnly.length === 10) {
      this.whatsAppPhone = `52${digitsOnly}`;
    } else {
      this.whatsAppPhone = digitsOnly;
    }

    const baseUrl = (this.settings.frontend_url || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/+$/, '');
    this.whatsAppPublicUrl = `${baseUrl}/bitacora-publica/${automobile.id}`;
    this.whatsAppPdfUrl = `${baseUrl}/bitacora-publica/${automobile.id}?download=true`;

    const vehicleSummary = [automobile.brand, automobile.submodel, automobile.model].filter(Boolean).join(' ');
    const workshopName = this.settings.pdf_header || 'LLANTAS Y SERVICIOS DE JALPA';

    this.whatsAppMessage = 
`¡Hola ${client?.name || 'estimado cliente'}! 🚗🔧
Le compartimos la bitácora de servicios de su vehículo *${automobile.licensePlate}* (${vehicleSummary}).

📋 Historial de servicios en línea:
${this.whatsAppPublicUrl}

📄 Descargar bitácora en PDF:
${this.whatsAppPdfUrl}

¡Gracias por su preferencia!
*${workshopName}*`;

    this.showWhatsAppModal = true;
  }

  sendViaWhatsApp() {
    if (!this.whatsAppPhone) {
      this.notification.show('Por favor ingrese un número de teléfono válido para WhatsApp.', 'error');
      return;
    }

    let cleanPhone = this.whatsAppPhone.replace(/\D/g, '');
    if (cleanPhone.length === 10) {
      cleanPhone = `52${cleanPhone}`;
    }

    const encodedText = encodeURIComponent(this.whatsAppMessage);
    let waUrl = '';

    if (this.isMobileDevice) {
      waUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    } else {
      waUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodedText}`;
    }

    window.open(waUrl, '_blank');
    this.showWhatsAppModal = false;
    this.notification.show('Abriendo chat de WhatsApp...', 'success');
  }

  // --- EMAIL FEATURE (Existing) ---
  openEmailPreview() {
    const automobile = this.getSelectedAuto();
    if (!automobile) return;

    const client = this.getSelectedClient();
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
      next: () => {
        this.loading = false;
        this.notification.show('Bitácora enviada por correo electrónico', 'success');
      },
      error: (err: any) => {
        this.loading = false;
        this.notification.show('Error al enviar la bitácora: ' + (err.error?.error || 'Desconocido'), 'error');
      }
    });
  }

  // --- FULL BITACORA PDF (Existing) ---
  generatePdf() {
    const autoId = this.selectionForm.get('automobileId')?.value;
    if (!autoId) return;

    this.loading = true;
    this.api.generateBitacora(autoId, false).subscribe({
      next: (res) => {
        this.loading = false;
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
