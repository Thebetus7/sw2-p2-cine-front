import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ESTADOS_SUCURSAL, EstadoSucursal, Sucursal } from '../../core/models/cinema.models';
import { CinemaCoreService } from '../../core/services/cinema-core.service';

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1>Sucursales</h1>
          <p>Administra las sedes del cine que agrupan salas y operaciones.</p>
        </div>
        <button type="button" class="ghost" (click)="openCreate()">Nueva sucursal</button>
      </header>

      @if (error) {
        <div class="alert">{{ error }}</div>
      }

      <section class="panel">
        <h2>Listado</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Nombre</th><th>Ciudad</th><th>Horario</th><th>Contacto</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              @for (sucursal of paginatedItems; track sucursal.id) {
                <tr>
                  <td>{{ sucursal.nombre }}</td>
                  <td>{{ sucursal.ciudad }}<br><span class="muted">{{ sucursal.direccion }}</span></td>
                  <td>{{ sucursal.horaApertura }} - {{ sucursal.horaCierre }}</td>
                  <td>{{ sucursal.telefono || '-' }}<br><span class="muted">{{ sucursal.email || '-' }}</span></td>
                  <td><span class="status ok">{{ sucursal.estado }}</span></td>
                  <td><button type="button" class="ghost" (click)="edit(sucursal)">Editar</button></td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="muted">Sin sucursales registradas.</td></tr>
              }
            </tbody>
          </table>
        </div>
        @if (totalPages > 1) {
          <div class="pagination">
            <button type="button" class="ghost" [disabled]="currentPage === 1" (click)="prevPage()">Anterior</button>
            <span class="muted">Pagina {{ currentPage }} de {{ totalPages }}</span>
            <button type="button" class="ghost" [disabled]="currentPage === totalPages" (click)="nextPage()">Siguiente</button>
          </div>
        }
      </section>
    </div>

    @if (showModal) {
      <div class="modal-overlay" (click)="closeModal()">
        <div class="modal" role="dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingId ? 'Editar sucursal' : 'Crear sucursal' }}</h2>
            <button type="button" class="ghost" (click)="closeModal()">Cerrar</button>
          </div>
          <form [formGroup]="form" class="grid three" (ngSubmit)="save()">
            <input formControlName="nombre" placeholder="Nombre" />
            <input formControlName="ciudad" placeholder="Ciudad" />
            <input formControlName="direccion" placeholder="Direccion" />
            <input formControlName="telefono" placeholder="Telefono" />
            <input formControlName="email" placeholder="Email" />
            <select formControlName="estado">
              @for (estado of estados; track estado) {
                <option [value]="estado">{{ estado }}</option>
              }
            </select>
            <input formControlName="horaApertura" type="time" />
            <input formControlName="horaCierre" type="time" />
            <div class="actions">
              <button type="submit" [disabled]="form.invalid || saving">Guardar</button>
              <button type="button" class="ghost" (click)="closeModal()">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class SucursalesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cinema = inject(CinemaCoreService);
  readonly pageSize = 10;
  readonly estados = ESTADOS_SUCURSAL;
  sucursales: Sucursal[] = [];
  currentPage = 1;
  editingId: string | null = null;
  showModal = false;
  saving = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    direccion: ['', Validators.required],
    ciudad: ['', Validators.required],
    telefono: [''],
    email: [''],
    horaApertura: ['09:00', Validators.required],
    horaCierre: ['23:30', Validators.required],
    estado: ['ABIERTA' as EstadoSucursal, Validators.required]
  });

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.sucursales.length / this.pageSize));
  }

  get paginatedItems(): Sucursal[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.sucursales.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.cinema.getSucursales().subscribe({
      next: (items) => {
        this.sucursales = items;
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
      },
      error: (error: Error) => this.error = error.message
    });
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  openCreate(): void {
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  edit(sucursal: Sucursal): void {
    this.editingId = sucursal.id;
    this.form.setValue({
      nombre: sucursal.nombre,
      direccion: sucursal.direccion,
      ciudad: sucursal.ciudad,
      telefono: sucursal.telefono ?? '',
      email: sucursal.email ?? '',
      horaApertura: sucursal.horaApertura,
      horaCierre: sucursal.horaCierre,
      estado: sucursal.estado
    });
    this.showModal = true;
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({
      nombre: '',
      direccion: '',
      ciudad: '',
      telefono: '',
      email: '',
      horaApertura: '09:00',
      horaCierre: '23:30',
      estado: 'ABIERTA'
    });
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }
    this.saving = true;
    this.error = '';
    const input = this.editingId ? { id: this.editingId, ...this.form.getRawValue() } : this.form.getRawValue();
    const request = this.editingId ? this.cinema.actualizarSucursal(input) : this.cinema.crearSucursal(input);
    request.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.load();
      },
      error: (error: Error) => {
        this.error = error.message;
        this.saving = false;
      }
    });
  }
}
