import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { 
  LucideAngularModule, 
  Car, 
  Calendar, 
  Gauge, 
  Wrench, 
  FileText, 
  CheckCircle, 
  ShieldCheck, 
  Download, 
  Phone, 
  MapPin, 
  Clock, 
  AlertCircle,
  ExternalLink,
  ChevronRight
} from 'lucide-angular';

@Component({
  selector: 'app-public-bitacora',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './public-bitacora.component.html',
})
export class PublicBitacoraComponent implements OnInit {
  automobile: any = null;
  services: any[] = [];
  settings: any = {};
  loading = true;
  error = '';

  readonly icons = {
    Car,
    Calendar,
    Gauge,
    Wrench,
    FileText,
    CheckCircle,
    ShieldCheck,
    Download,
    Phone,
    MapPin,
    Clock,
    AlertCircle,
    ExternalLink,
    ChevronRight
  };

  constructor(
    private route: ActivatedRoute,
    public api: ApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error = 'No se especificó un vehículo válido.';
      this.loading = false;
      return;
    }

    this.api.getPublicBitacora(id).subscribe({
      next: (res) => {
        this.automobile = res.automobile;
        this.services = res.services || [];
        this.settings = res.settings || {};
        this.loading = false;

        if (this.route.snapshot.queryParamMap.get('download') === 'true') {
          setTimeout(() => this.downloadPdf(), 300);
        }
      },
      error: (err) => {
        console.error('Error fetching public bitacora', err);
        this.error = err.error?.error || 'No se pudo encontrar el historial de este vehículo.';
        this.loading = false;
      }
    });
  }

  get latestMileage(): number | null {
    if (!this.services || this.services.length === 0) return null;
    const sorted = [...this.services].filter(s => s.mileage).sort((a, b) => b.mileage - a.mileage);
    return sorted.length > 0 ? sorted[0].mileage : null;
  }

  get lastServiceDate(): string | null {
    if (!this.services || this.services.length === 0) return null;
    return this.services[0].serviceDate;
  }

  downloadPdf(): void {
    if (!this.automobile?.id) return;
    const pdfUrl = this.api.getPublicBitacoraPdfUrl(this.automobile.id);
    window.open(pdfUrl, '_blank');
  }
}
