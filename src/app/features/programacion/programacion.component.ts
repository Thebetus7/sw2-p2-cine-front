import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { forkJoin } from 'rxjs';
import {
  Funcion,
  Pelicula,
  ProgramacionDetalle,
  ProgramacionRow,
  Sala,
  Sucursal
} from '../../core/models/cinema.models';
import { CinemaCoreService } from '../../core/services/cinema-core.service';
import { ProgramacionDetailComponent } from './programacion-detail.component';
import { ProgramacionModalComponent, ProgramacionSavePayload } from './programacion-modal.component';
import { ProgramacionTableComponent } from './programacion-table.component';

@Component({
  selector: 'app-programacion',
  standalone: true,
  imports: [
    CommonModule,
    ProgramacionTableComponent,
    ProgramacionModalComponent,
    ProgramacionDetailComponent
  ],
  styles: [`
    .header-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .progress-bar {
      margin-top: 0.75rem;
      height: 8px;
      background: rgba(255,255,255,0.08);
      border-radius: 999px;
      overflow: hidden;
    }
    .progress-bar span {
      display: block;
      height: 100%;
      background: #6366f1;
      transition: width 0.2s ease;
    }
  `],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1>Programacion</h1>
          <p>Asignacion de salas, horarios y peliculas para funciones del cine.</p>
        </div>
        <div class="header-actions">
          <button type="button" class="ghost" (click)="openCreate()" [disabled]="seeding">Nueva funcion</button>
          <button type="button" class="ghost" (click)="seedFunciones()" [disabled]="seeding">
            {{ seeding ? 'Generando...' : 'Generar 40 funciones de prueba' }}
          </button>
        </div>
      </header>

      @if (error) {
        <div class="alert">{{ error }}</div>
      }
      @if (success) {
        <div class="alert" style="border-color:#22c55e">{{ success }}</div>
      }
      @if (seeding) {
        <div class="progress-bar"><span [style.width.%]="seedProgress"></span></div>
      }

      <app-programacion-table
        [items]="paginatedItems"
        [currentPage]="currentPage"
        [totalPages]="totalPages"
        (viewDetail)="openDetail($event)"
        (prevPage)="prevPage()"
        (nextPage)="nextPage()"
      />
    </div>

    <app-programacion-modal
      [visible]="showModal"
      [peliculas]="peliculasProgramables"
      [salas]="salasDisponibles"
      [saving]="saving"
      (closed)="closeModal()"
      (saved)="save($event)"
    />

    <app-programacion-detail
      [visible]="showDetail"
      [detalle]="detalle"
      (closed)="closeDetail()"
    />
  `
})
export class ProgramacionComponent implements OnInit {
  private readonly cinema = inject(CinemaCoreService);
  readonly pageSize = 10;

  rows: ProgramacionRow[] = [];
  peliculasProgramables: Pelicula[] = [];
  salasDisponibles: Sala[] = [];
  sucursales: Sucursal[] = [];
  peliculasMap = new Map<string, Pelicula>();
  salasMap = new Map<string, Sala>();
  sucursalesMap = new Map<string, Sucursal>();

  currentPage = 1;
  showModal = false;
  showDetail = false;
  saving = false;
  seeding = false;
  seedProgress = 0;
  error = '';
  success = '';
  detalle: ProgramacionDetalle | null = null;

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.rows.length / this.pageSize));
  }

  get paginatedItems(): ProgramacionRow[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.rows.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.loadCatalogs();
    this.loadFunciones();
  }

  loadCatalogs(): void {
    forkJoin({
      peliculas: this.cinema.getPeliculasProgramables(),
      salas: this.cinema.getSalasDisponibles(),
      sucursales: this.cinema.getSucursales()
    }).subscribe({
      next: ({ peliculas, salas, sucursales }) => {
        this.peliculasProgramables = peliculas;
        this.salasDisponibles = salas;
        this.sucursales = sucursales;
        this.peliculasMap = new Map(peliculas.map((p) => [p.id, p]));
        this.salasMap = new Map(salas.map((s) => [s.id, s]));
        this.sucursalesMap = new Map(sucursales.map((s) => [s.id, s]));
      },
      error: (err: Error) => this.error = err.message
    });
  }

  loadFunciones(): void {
    forkJoin({
      funciones: this.cinema.getFunciones(),
      peliculas: this.cinema.getPeliculas(),
      salas: this.cinema.getSalas(),
      sucursales: this.cinema.getSucursales()
    }).subscribe({
      next: ({ funciones, peliculas, salas, sucursales }) => {
        const pelMap = new Map(peliculas.map((p) => [p.id, p]));
        const salaMap = new Map(salas.map((s) => [s.id, s]));
        const sucMap = new Map(sucursales.map((s) => [s.id, s]));
        this.rows = funciones
          .slice()
          .sort((a, b) => b.fechaHoraIni.localeCompare(a.fechaHoraIni))
          .map((funcion) => this.toRow(funcion, pelMap, salaMap, sucMap));
        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }
      },
      error: (err: Error) => this.error = err.message
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
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  closeDetail(): void {
    this.showDetail = false;
    this.detalle = null;
  }

  openDetail(idFuncion: string): void {
    this.cinema.getProgramacionDetalle(idFuncion).subscribe({
      next: (detalle) => {
        this.detalle = detalle;
        this.showDetail = true;
      },
      error: (err: Error) => this.error = err.message
    });
  }

  save(payload: ProgramacionSavePayload): void {
    this.saving = true;
    this.error = '';
    const { formValue, pelicula, sala } = payload;
    const fechaHoraIni = `${formValue.fecha}T${formValue.hora}:00`;
    const ini = new Date(fechaHoraIni);
    const fin = new Date(ini.getTime() + pelicula.duracionMinutos * 60_000);

    const input = {
      fechaHoraIni: ini.toISOString().slice(0, 19),
      fechaHoraFin: fin.toISOString().slice(0, 19),
      precioBase: formValue.precioBase,
      precioVip: formValue.precioVip,
      precioPreferente: formValue.precioPreferente,
      idioma: formValue.idioma,
      estado: formValue.estado,
      butacasDisponibles: sala.capacidadTotal,
      idSala: formValue.idSala,
      idPelicula: formValue.idPelicula
    };

    this.cinema.crearFuncion(input).subscribe({
      next: (funcion) => {
        this.saving = false;
        this.closeModal();
        this.loadFunciones();
        this.openDetail(funcion.id);
        this.success = 'Programacion creada correctamente.';
      },
      error: (err: Error) => {
        this.error = err.message;
        this.saving = false;
      }
    });
  }

  seedFunciones(): void {
    if (!confirm('Generar 40 funciones de prueba con salas y peliculas existentes?')) {
      return;
    }
    this.seeding = true;
    this.seedProgress = 20;
    this.error = '';
    this.success = '';
    this.cinema.sembrarFuncionesPrueba(40).subscribe({
      next: (cantidad) => {
        this.seedProgress = 100;
        this.seeding = false;
        this.success = `Se generaron ${cantidad} funciones de prueba.`;
        this.loadFunciones();
        this.loadCatalogs();
      },
      error: (err: Error) => {
        this.error = err.message;
        this.seeding = false;
        this.seedProgress = 0;
      }
    });
  }

  private toRow(
    funcion: Funcion,
    pelMap: Map<string, Pelicula>,
    salaMap: Map<string, Sala>,
    sucMap: Map<string, Sucursal>
  ): ProgramacionRow {
    const pelicula = pelMap.get(funcion.idPelicula);
    const sala = salaMap.get(funcion.idSala);
    const sucursal = sala ? sucMap.get(sala.idSucursal) : undefined;
    return {
      funcion,
      peliculaTitulo: pelicula?.titulo ?? funcion.idPelicula,
      salaNombre: sala?.nombre ?? funcion.idSala,
      sucursalNombre: sucursal?.nombre ?? ''
    };
  }
}
