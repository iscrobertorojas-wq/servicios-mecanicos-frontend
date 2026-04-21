import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { NotificationService } from '../../services/notification.service';
import { LucideAngularModule, Plus, Search, Edit3, Trash2, Car, User, X, Hash } from 'lucide-angular';

@Component({
  selector: 'app-automobiles',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: './automobiles.component.html',
})
export class AutomobilesComponent implements OnInit {
  automobiles: any[] = [];
  clients: any[] = [];
  autoForm: FormGroup;
  showModal = false;
  editingId: number | null = null;
  searchTerm = '';

  readonly icons = { Plus, Search, Edit3, Trash2, Car, User, X, Hash };

  constructor(
    private api: ApiService, 
    private fb: FormBuilder,
    private ns: NotificationService
  ) {
    this.autoForm = this.fb.group({
      clientId: ['', Validators.required],
      licensePlate: ['', Validators.required],
      brand: [''],
      submodel: [''],
      model: [''],
      type: [''],
    });
  }

  ngOnInit(): void {
    this.loadAutomobiles();
    this.loadClients();
  }

  loadAutomobiles() {
    this.api.getAutomobiles(undefined, this.searchTerm).subscribe((res) => this.automobiles = res);
  }

  loadClients() {
    this.api.getClients().subscribe((res) => this.clients = res);
  }

  onSearchChange(event: any) {
    this.searchTerm = event.target.value;
    this.loadAutomobiles();
  }

  openModal(auto: any = null) {
    this.showModal = true;
    if (auto) {
      this.editingId = auto.id;
      this.autoForm.patchValue(auto);
    } else {
      this.editingId = null;
      this.autoForm.reset();
    }
  }

  closeModal() {
    this.showModal = false;
    this.autoForm.reset();
  }

  onSubmit() {
    if (this.autoForm.invalid) return;

    const promise = this.editingId 
      ? this.api.updateAutomobile(this.editingId, this.autoForm.value)
      : this.api.createAutomobile(this.autoForm.value);

    promise.subscribe({
      next: () => {
        this.loadAutomobiles();
        this.closeModal();
        this.ns.success(this.editingId ? 'Vehículo actualizado' : 'Vehículo registrado');
      },
      error: (err) => this.ns.error(err.error?.error || 'Error al guardar vehículo')
    });
  }

  async deleteAutomobile(id: number) {
    if (await this.ns.confirm('¿Estás seguro de eliminar este vehículo?')) {
      this.api.deleteAutomobile(id).subscribe({
        next: () => {
          this.loadAutomobiles();
          this.ns.success('Vehículo eliminado correctamente');
        },
        error: (err) => this.ns.error(err.error?.error || 'Error al eliminar vehículo')
      });
    }
  }
}
