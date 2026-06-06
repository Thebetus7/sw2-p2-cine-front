import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ESTADOS_SALA, EstadoSala, Sala, Sucursal, TIPOS_SALA, TipoSala } from '../../core/models/cinema.models';
import { CinemaCoreService } from '../../core/services/cinema-core.service';

@Component({
  selector: 'app-salas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1>Salas</h1>
          <p>Gestiona salas asociadas a cada sucursal.</p>
        </div>
        <button type="button" class="ghost" (click)="openCreate()">Nueva sala</button>
      </header>

      @if (error) {
        <div class="alert">{{ error }}</div>
      }

      <section class="panel">
        <div class="page-header">
          <div>
            <h2>Listado</h2>
            <p>Filtra por sucursal para revisar capacidad y estado.</p>
          </div>
          <select [value]="filterSucursal" (change)="filter(($any($event.target)).value)">
            <option value="">Todas las sucursales</option>
            @for (sucursal of sucursales; track sucursal.id) {
              <option [value]="sucursal.id">{{ sucursal.nombre }}</option>
            }
          </select>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Sala</th><th>Sucursal</th><th>Tipo</th><th>Capacidad</th><th>Estado</th><th></th></tr>
            </thead>
            <tbody>
              @for (sala of paginatedItems; track sala.id) {
                <tr>
                  <td>{{ sala.nombre }}</td>
                  <td>{{ sucursalNombre(sala.idSucursal) }}</td>
                  <td><span class="tag">{{ sala.tipo }}</span></td>
                  <td>{{ sala.capacidadTotal }}</td>
                  <td><span class="status ok">{{ sala.estado }}</span></td>
                  <td><button type="button" class="ghost" (click)="edit(sala)">Editar</button></td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="muted">Sin salas registradas.</td></tr>
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
            <h2>{{ editingId ? 'Editar sala' : 'Crear sala' }}</h2>
            <button type="button" class="ghost" (click)="closeModal()">Cerrar</button>
          </div>
          <form [formGroup]="form" class="grid three" (ngSubmit)="save()">
            <input formControlName="nombre" placeholder="Nombre" />
            <select formControlName="idSucursal">
              <option value="">Sucursal</option>
              @for (sucursal of sucursales; track sucursal.id) {
                <option [value]="sucursal.id">{{ sucursal.nombre }}</option>
              }
            </select>
            <select formControlName="tipo">
              @for (tipo of tipos; track tipo) {
                <option [value]="tipo">{{ tipo }}</option>
              }
            </select>
            <input formControlName="capacidadTotal" type="number" min="0" placeholder="Capacidad" />
            <select formControlName="estado">
              @for (estado of estados; track estado) {
                <option [value]="estado">{{ estado }}</option>
              }
            </select>
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
export class SalasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cinema = inject(CinemaCoreService);
  readonly pageSize = 10;
  readonly tipos = TIPOS_SALA;
  readonly estados = ESTADOS_SALA;
  sucursales: Sucursal[] = [];
  salas: Sala[] = [];
  filterSucursal = '';
  currentPage = 1;
  editingId: string | null = null;
  showModal = false;
  saving = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    tipo: ['FORMATO_2D' as TipoSala, Validators.required],
    capacidadTotal: [0, [Validators.required, Validators.min(0)]],
    estado: ['DISPONIBLE' as EstadoSala, Validators.required],
    idSucursal: ['', Validators.required]
  });

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.salas.length / this.pageSize));
  }

  get paginatedItems(): Sala[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.salas.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.loadSucursales();
    this.loadSalas();
  }

  loadSucursales(): void {
    this.cinema.getSucursales().subscribe({
      next: (items) => this.sucursales = items,
      error: (error: Error) => this.error = error.message
    });
  }

  loadSalas(): void {
    const request = this.filterSucursal ? this.cinema.getSalasPorSucursal(this.filterSucursal) : this.cinema.getSalas();
    request.subscribe({
      next: (items) => {
        this.salas = items;
        this.currentPage = 1;
      },
      error: (error: Error) => this.error = error.message
    });
  }

  filter(idSucursal: string): void {
    this.filterSucursal = idSucursal;
    this.loadSalas();
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

  sucursalNombre(idSucursal: string): string {
    return this.sucursales.find((item) => item.id === idSucursal)?.nombre ?? idSucursal;
  }

  openCreate(): void {
    this.resetForm();
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.resetForm();
  }

  edit(sala: Sala): void {
    this.editingId = sala.id;
    this.form.setValue({
      nombre: sala.nombre,
      tipo: sala.tipo,
      capacidadTotal: sala.capacidadTotal,
      estado: sala.estado,
      idSucursal: sala.idSucursal
    });
    this.showModal = true;
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({
      nombre: '',
      tipo: 'FORMATO_2D',
      capacidadTotal: 0,
      estado: 'DISPONIBLE',
      idSucursal: ''
    });
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }
    this.saving = true;
    this.error = '';
    const input = this.editingId ? { id: this.editingId, ...this.form.getRawValue() } : this.form.getRawValue();
    const request = this.editingId ? this.cinema.actualizarSala(input) : this.cinema.crearSala(input);
    request.subscribe({
      next: () => {
        this.saving = false;
        this.closeModal();
        this.loadSalas();
      },
      error: (error: Error) => {
        this.error = error.message;
        this.saving = false;
      }
    });
  }
}
