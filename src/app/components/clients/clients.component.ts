import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl, ValidationErrors } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { LucideAngularModule, Plus, Search, Edit3, Trash2, Mail, Phone, MapPin, X } from 'lucide-angular';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './clients.component.html',
})
export class ClientsComponent implements OnInit {
  clients: any[] = [];
  clientForm: FormGroup;
  showModal = false;
  editingId: number | null = null;
  searchTerm = '';

  readonly icons = { Plus, Search, Edit3, Trash2, Mail, Phone, MapPin, X };

  constructor(
    private api: ApiService, 
    private fb: FormBuilder,
    private ns: NotificationService
  ) {
    this.clientForm = this.fb.group({
      name: ['', Validators.required],
      phone: [''],
      email: ['', [this.multipleEmailsValidator]],
      address: [''],
      rfc: [''],
    });
  }

  multipleEmailsValidator(control: AbstractControl): ValidationErrors | null {
    if (!control.value) return null;
    const emails = control.value.split(';').map((e: string) => e.trim()).filter((e: string) => e);
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i;
    const invalid = emails.some((e: string) => !emailPattern.test(e));
    return invalid ? { multipleEmails: true } : null;
  }

  ngOnInit(): void {
    this.loadClients();
  }

  loadClients() {
    this.api.getClients(this.searchTerm).subscribe((res) => this.clients = res);
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.loadClients();
  }

  openModal(client: any = null) {
    this.showModal = true;
    if (client) {
      this.editingId = client.id;
      this.clientForm.patchValue(client);
    } else {
      this.editingId = null;
      this.clientForm.reset();
    }
  }

  closeModal() {
    this.showModal = false;
    this.clientForm.reset();
  }

  onSubmit() {
    if (this.clientForm.invalid) {
      this.ns.error('Por favor, revise los campos marcados en rojo.');
      return;
    }

    const promise = this.editingId 
      ? this.api.updateClient(this.editingId, this.clientForm.value)
      : this.api.createClient(this.clientForm.value);

    promise.subscribe({
      next: () => {
        this.loadClients();
        this.closeModal();
        this.ns.success(this.editingId ? 'Cliente actualizado' : 'Cliente creado');
      },
      error: (err) => this.ns.error(err.error?.error || 'Error al guardar cliente')
    });
  }

  async deleteClient(id: number) {
    if (await this.ns.confirm('¿Estás seguro de eliminar este cliente?')) {
      this.api.deleteClient(id).subscribe({
        next: () => {
          this.loadClients();
          this.ns.success('Cliente eliminado correctamente');
        },
        error: (err) => this.ns.error(err.error?.error || 'Error al eliminar cliente')
      });
    }
  }
}
