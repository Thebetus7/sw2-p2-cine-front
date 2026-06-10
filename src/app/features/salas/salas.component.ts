import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Sala, Sucursal } from '../../core/models/cinema.models';
import { CinemaCoreService } from '../../core/services/cinema-core.service';
import { SalaFormValue, SalasModalComponent } from './salas-modal.component';
import { SalasTableComponent } from './salas-table.component';

@Component({
  selector: 'app-salas',
  standalone: true,
  imports: [CommonModule, SalasTableComponent, SalasModalComponent],
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

      <app-salas-table
        [items]="paginatedItems"
        [sucursales]="sucursales"
        [filterSucursal]="filterSucursal"
        [currentPage]="currentPage"
        [totalPages]="totalPages"
        (filterChange)="filter($event)"
        (edit)="edit($event)"
        (prevPage)="prevPage()"
        (nextPage)="nextPage()"
      />
    </div>

    <app-salas-modal
      [visible]="showModal"
      [sala]="editingSala"
      [sucursales]="sucursales"
      [saving]="saving"
      (closed)="closeModal()"
      (saved)="save($event)"
    />
  `
})
export class SalasComponent implements OnInit {
  private readonly cinema = inject(CinemaCoreService);
  readonly pageSize = 10;
  sucursales: Sucursal[] = [];
  salas: Sala[] = [];
  filterSucursal = '';
  currentPage = 1;
  editingSala: Sala | null = null;
  showModal = false;
  saving = false;
  error = '';

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

  openCreate(): void {
    this.editingSala = null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingSala = null;
  }

  edit(sala: Sala): void {
    this.editingSala = sala;
    this.showModal = true;
  }

  save(payload: { formValue: SalaFormValue; editingId: string | null }): void {
    this.saving = true;
    this.error = '';
    const input: Record<string, unknown> = payload.editingId
      ? { id: payload.editingId, ...payload.formValue }
      : { ...payload.formValue };
    const request = payload.editingId
      ? this.cinema.actualizarSala(input)
      : this.cinema.crearSala(input);
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
