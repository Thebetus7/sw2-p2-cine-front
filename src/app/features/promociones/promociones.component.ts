import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Promocion, TIPOS_PROMOCION, TipoPromocion } from '../../core/models/cinema.models';
import { CinemaCoreService } from '../../core/services/cinema-core.service';

@Component({
  selector: 'app-promociones',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1>Promociones</h1>
          <p>Gestiona descuentos y promociones del modulo cinema-core.</p>
        </div>
        <button type="button" class="ghost" (click)="openCreate()">Nueva promocion</button>
      </header>

      @if (error) {
        <div class="alert">{{ error }}</div>
      }

      <section class="panel">
        <h2>Listado</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Nombre</th><th>Tipo</th><th>Monto</th><th>Fecha descuento</th><th></th></tr>
            </thead>
            <tbody>
              @for (promocion of paginatedItems; track promocion.id) {
                <tr>
                  <td>
                    <strong>{{ promocion.nombre }}</strong><br>
                    <span class="muted">{{ promocion.descripcion || '-' }}</span>
                  </td>
                  <td><span class="tag">{{ promocion.tipo }}</span></td>
                  <td>{{ promocion.montoFijo ?? '-' }}</td>
                  <td>{{ promocion.fechaDescuento || '-' }}</td>
                  <td class="actions">
                    <button type="button" class="ghost" (click)="edit(promocion)">Editar</button>
                    <button type="button" class="danger" (click)="remove(promocion)">Eliminar</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="5" class="muted">Sin promociones registradas.</td></tr>
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
            <h2>{{ editingId ? 'Editar promocion' : 'Crear promocion' }}</h2>
            <button type="button" class="ghost" (click)="closeModal()">Cerrar</button>
          </div>
          <form [formGroup]="form" class="grid" (ngSubmit)="save()">
            <input formControlName="nombre" placeholder="Nombre" />
            <textarea formControlName="descripcion" placeholder="Descripcion"></textarea>
            <select formControlName="tipo">
              @for (tipo of tipos; track tipo) {
                <option [value]="tipo">{{ tipo }}</option>
              }
            </select>
            <input formControlName="montoFijo" type="number" min="0" placeholder="Monto fijo" />
            <input formControlName="fechaDescuento" type="date" />
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
export class PromocionesComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cinema = inject(CinemaCoreService);
  readonly pageSize = 10;
  readonly tipos = TIPOS_PROMOCION;
  promociones: Promocion[] = [];
  currentPage = 1;
  editingId: string | null = null;
  showModal = false;
  saving = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    descripcion: [''],
    tipo: ['MONTO_FIJO' as TipoPromocion, Validators.required],
    montoFijo: [0, Validators.min(0)],
    fechaDescuento: ['']
  });

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.promociones.length / this.pageSize));
  }

  get paginatedItems(): Promocion[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.promociones.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.cinema.getPromociones().subscribe({
      next: (items) => {
        this.promociones = items;
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

  edit(promocion: Promocion): void {
    this.editingId = promocion.id;
    this.form.setValue({
      nombre: promocion.nombre,
      descripcion: promocion.descripcion ?? '',
      tipo: promocion.tipo,
      montoFijo: promocion.montoFijo ?? 0,
      fechaDescuento: promocion.fechaDescuento ?? ''
    });
    this.showModal = true;
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({
      nombre: '',
      descripcion: '',
      tipo: 'MONTO_FIJO',
      montoFijo: 0,
      fechaDescuento: ''
    });
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }
    this.saving = true;
    this.error = '';
    const raw = this.form.getRawValue();
    const input = {
      ...(this.editingId ? { id: this.editingId } : {}),
      nombre: raw.nombre,
      descripcion: raw.descripcion || null,
      tipo: raw.tipo,
      montoFijo: raw.montoFijo,
      fechaDescuento: raw.fechaDescuento || null
    };
    const request = this.editingId ? this.cinema.actualizarPromocion(input) : this.cinema.crearPromocion(input);
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

  remove(promocion: Promocion): void {
    if (!confirm(`Eliminar ${promocion.nombre}?`)) {
      return;
    }
    this.cinema.eliminarPromocion(promocion.id).subscribe({
      next: () => this.load(),
      error: (error: Error) => this.error = error.message
    });
  }
}
