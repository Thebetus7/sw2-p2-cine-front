import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ESTADOS_PELICULA, EstadoPelicula, GENEROS_PELICULA, GeneroPelicula, Pelicula } from '../../core/models/cinema.models';
import { CinemaCoreService } from '../../core/services/cinema-core.service';

@Component({
  selector: 'app-peliculas',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="page">
      <header class="page-header">
        <div>
          <h1>Peliculas</h1>
          <p>Catalogo de peliculas disponible para cartelera y funciones.</p>
        </div>
        <button type="button" class="ghost" (click)="openCreate()">Nueva pelicula</button>
      </header>

      @if (error) {
        <div class="alert">{{ error }}</div>
      }

      <section class="panel">
        <h2>Catalogo</h2>
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Pelicula</th><th>Estado</th><th>Genero</th><th>Duracion</th><th>Director</th><th></th></tr>
            </thead>
            <tbody>
              @for (pelicula of paginatedItems; track pelicula.id) {
                <tr>
                  <td>
                    <strong>{{ pelicula.titulo }}</strong><br>
                    <span class="muted">{{ pelicula.clasificacion || '-' }}</span>
                  </td>
                  <td><span class="status ok">{{ pelicula.estado }}</span></td>
                  <td>{{ pelicula.generos.join(', ') }}</td>
                  <td>{{ pelicula.duracionMinutos }} min</td>
                  <td>{{ pelicula.director || '-' }}</td>
                  <td class="actions">
                    <button type="button" class="ghost" (click)="edit(pelicula)">Editar</button>
                    <button type="button" class="danger" (click)="remove(pelicula)">Eliminar</button>
                  </td>
                </tr>
              } @empty {
                <tr><td colspan="6" class="muted">Sin peliculas registradas.</td></tr>
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
            <h2>{{ editingId ? 'Editar pelicula' : 'Crear pelicula' }}</h2>
            <button type="button" class="ghost" (click)="closeModal()">Cerrar</button>
          </div>
          <form [formGroup]="form" class="grid three" (ngSubmit)="save()">
            <input formControlName="titulo" placeholder="Titulo" />
            <input formControlName="tituloOriginal" placeholder="Titulo original" />
            <input formControlName="director" placeholder="Director" />
            <input formControlName="duracionMinutos" type="number" min="1" placeholder="Duracion" />
            <input formControlName="clasificacion" placeholder="Clasificacion" />
            <input formControlName="fechaEstreno" type="date" />
            <select formControlName="estado">
              @for (estado of estados; track estado) {
                <option [value]="estado">{{ estado }}</option>
              }
            </select>
            <input formControlName="posterUrl" placeholder="Poster URL" />
            <input formControlName="trailerUrl" placeholder="Trailer URL" />
            <select formControlName="generoPrincipal">
              @for (genero of generos; track genero) {
                <option [value]="genero">{{ genero }}</option>
              }
            </select>
            <textarea formControlName="sinopsis" placeholder="Sinopsis"></textarea>
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
export class PeliculasComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly cinema = inject(CinemaCoreService);
  readonly pageSize = 10;
  readonly estados = ESTADOS_PELICULA;
  readonly generos = GENEROS_PELICULA;
  peliculas: Pelicula[] = [];
  currentPage = 1;
  editingId: string | null = null;
  showModal = false;
  saving = false;
  error = '';

  readonly form = this.fb.nonNullable.group({
    titulo: ['', Validators.required],
    tituloOriginal: [''],
    duracionMinutos: [90, [Validators.required, Validators.min(1)]],
    sinopsis: [''],
    clasificacion: [''],
    generoPrincipal: ['ACCION' as GeneroPelicula, Validators.required],
    fechaEstreno: [''],
    estado: ['CARTELERA' as EstadoPelicula, Validators.required],
    posterUrl: [''],
    trailerUrl: [''],
    director: ['']
  });

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.peliculas.length / this.pageSize));
  }

  get paginatedItems(): Pelicula[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.peliculas.slice(start, start + this.pageSize);
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.cinema.getPeliculas().subscribe({
      next: (items) => {
        this.peliculas = items;
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

  edit(pelicula: Pelicula): void {
    this.editingId = pelicula.id;
    this.form.setValue({
      titulo: pelicula.titulo,
      tituloOriginal: pelicula.tituloOriginal ?? '',
      duracionMinutos: pelicula.duracionMinutos,
      sinopsis: pelicula.sinopsis ?? '',
      clasificacion: pelicula.clasificacion ?? '',
      generoPrincipal: pelicula.generos[0] ?? 'ACCION',
      fechaEstreno: pelicula.fechaEstreno ?? '',
      estado: pelicula.estado,
      posterUrl: pelicula.posterUrl ?? '',
      trailerUrl: pelicula.trailerUrl ?? '',
      director: pelicula.director ?? ''
    });
    this.showModal = true;
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({
      titulo: '',
      tituloOriginal: '',
      duracionMinutos: 90,
      sinopsis: '',
      clasificacion: '',
      generoPrincipal: 'ACCION',
      fechaEstreno: '',
      estado: 'CARTELERA',
      posterUrl: '',
      trailerUrl: '',
      director: ''
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
      titulo: raw.titulo,
      tituloOriginal: raw.tituloOriginal || null,
      duracionMinutos: raw.duracionMinutos,
      sinopsis: raw.sinopsis || null,
      clasificacion: raw.clasificacion || null,
      generos: [raw.generoPrincipal],
      fechaEstreno: raw.fechaEstreno || null,
      estado: raw.estado,
      posterUrl: raw.posterUrl || null,
      trailerUrl: raw.trailerUrl || null,
      director: raw.director || null
    };
    const request = this.editingId ? this.cinema.actualizarPelicula(input) : this.cinema.crearPelicula(input);
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

  remove(pelicula: Pelicula): void {
    if (!confirm(`Eliminar ${pelicula.titulo}?`)) {
      return;
    }
    this.cinema.eliminarPelicula(pelicula.id).subscribe({
      next: () => this.load(),
      error: (error: Error) => this.error = error.message
    });
  }
}
