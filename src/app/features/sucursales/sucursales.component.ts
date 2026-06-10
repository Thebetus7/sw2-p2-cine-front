import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Sucursal } from '../../core/models/cinema.models';
import { CinemaCoreService } from '../../core/services/cinema-core.service';
import { SucursalFormValue, SucursalesModalComponent } from './sucursales-modal.component';
import { SucursalesTableComponent } from './sucursales-table.component';

@Component({
  selector: 'app-sucursales',
  standalone: true,
  imports: [CommonModule, SucursalesTableComponent, SucursalesModalComponent],
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

      <app-sucursales-table
        [items]="paginatedItems"
        [currentPage]="currentPage"
        [totalPages]="totalPages"
        (edit)="edit($event)"
        (prevPage)="prevPage()"
        (nextPage)="nextPage()"
      />
    </div>

    <app-sucursales-modal
      [visible]="showModal"
      [sucursal]="editingSucursal"
      [saving]="saving"
      (closed)="closeModal()"
      (saved)="save($event)"
    />
  `
})
export class SucursalesComponent implements OnInit {
  private readonly cinema = inject(CinemaCoreService);
  readonly pageSize = 10;
  sucursales: Sucursal[] = [];
  currentPage = 1;
  editingSucursal: Sucursal | null = null;
  showModal = false;
  saving = false;
  error = '';

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
    this.editingSucursal = null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingSucursal = null;
  }

  edit(sucursal: Sucursal): void {
    this.editingSucursal = sucursal;
    this.showModal = true;
  }

  save(payload: { formValue: SucursalFormValue; editingId: string | null }): void {
    this.saving = true;
    this.error = '';
    const input: Record<string, unknown> = payload.editingId
      ? { id: payload.editingId, ...payload.formValue }
      : { ...payload.formValue };
    const request = payload.editingId
      ? this.cinema.actualizarSucursal(input)
      : this.cinema.crearSucursal(input);
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
