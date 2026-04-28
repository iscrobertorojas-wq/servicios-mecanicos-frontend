import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { LucideAngularModule, Plus, Search, Edit3, Trash2, Calendar, User, Car, X, Filter } from 'lucide-angular';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './services.component.html',
})
export class ServicesComponent implements OnInit {
  services: any[] = [];
  clients: any[] = [];
  automobiles: any[] = []; // for the modal form
  formAutomobiles: any[] = []; // filtered for form
  
  serviceForm: FormGroup;
  filterForm: FormGroup;
  
  showModal = false;
  editingId: number | null = null;
  showFilters = false;

  readonly icons = { Plus, Search, Edit3, Trash2, Calendar, User, Car, X, Filter };

  constructor(
    private api: ApiService, 
    private fb: FormBuilder,
    private ns: NotificationService
  ) {
    this.serviceForm = this.fb.group({
      clientId: ['', Validators.required],
      automobileId: ['', Validators.required],
      serviceDate: [new Date().toISOString().split('T')[0], Validators.required],
      deliveryDate: [''],
      description: ['', Validators.required],
      observations: [''],
      mileage: ['', Validators.required],
      replacedParts: ['', Validators.required],
      responsible: ['', Validators.required],
      invoiceNumber: ['', Validators.required],
      invoiceTotal: [0, [Validators.required, Validators.min(0.01)]],
    });

    this.filterForm = this.fb.group({
      clientId: [''],
      automobileId: [''],
      startDate: [''],
      endDate: [''],
    });
  }

  ngOnInit(): void {
    this.loadServices();
    this.loadClients();
  }

  loadServices() {
    this.api.getServices(this.filterForm.value).subscribe((res) => this.services = res);
  }

  loadClients() {
    this.api.getClients().subscribe((res) => this.clients = res);
  }

  onClientChange(clientId: any) {
    if (clientId) {
      this.api.getAutomobiles(clientId).subscribe((res) => {
        this.formAutomobiles = res;
        this.serviceForm.get('automobileId')?.enable();
        this.serviceForm.patchValue({ automobileId: '' });
      });
    } else {
      this.formAutomobiles = [];
      this.serviceForm.get('automobileId')?.disable();
    }
  }

  openModal(service: any = null) {
    this.showModal = true;
    if (service) {
      this.editingId = service.id;
      const formattedDate = new Date(service.serviceDate).toISOString().split('T')[0];
      const formattedDeliveryDate = service.deliveryDate ? new Date(service.deliveryDate).toISOString().split('T')[0] : '';
      this.serviceForm.patchValue({
        ...service,
        serviceDate: formattedDate,
        deliveryDate: formattedDeliveryDate
      });
      // Load autos for the specific client
      this.onClientChange(service.clientId);
      setTimeout(() => this.serviceForm.patchValue({ automobileId: service.automobileId }), 100);
    } else {
      this.editingId = null;
      this.serviceForm.reset({
        serviceDate: new Date().toISOString().split('T')[0],
        invoiceTotal: 0
      });
      this.serviceForm.get('automobileId')?.disable();
      this.formAutomobiles = [];
    }
  }

  closeModal() {
    this.showModal = false;
    this.serviceForm.reset();
  }

  onSubmit() {
    if (this.serviceForm.invalid) {
      this.ns.error('Por favor, complete todos los campos obligatorios.');
      return;
    }

    const promise = this.editingId 
      ? this.api.updateService(this.editingId, this.serviceForm.value)
      : this.api.createService(this.serviceForm.value);

    promise.subscribe({
      next: () => {
        this.loadServices();
        this.closeModal();
        this.ns.success(this.editingId ? 'Servicio actualizado' : 'Servicio registrado');
      },
      error: (err) => this.ns.error(err.error?.error || 'Error al guardar servicio')
    });
  }

  async deleteService(id: number) {
    if (await this.ns.confirm('¿Estás seguro de eliminar este registro?')) {
      this.api.deleteService(id).subscribe({
        next: () => {
          this.loadServices();
          this.ns.success('Servicio eliminado correctamente');
        },
        error: (err) => this.ns.error(err.error?.error || 'Error al eliminar servicio')
      });
    }
  }

  resetFilters() {
    this.filterForm.reset();
    this.loadServices();
  }
}
