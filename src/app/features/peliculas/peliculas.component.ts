import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { switchMap } from 'rxjs';
import { Pelicula } from '../../core/models/cinema.models';
import { CinemaCoreService } from '../../core/services/cinema-core.service';
import { MultimediaService } from '../../core/services/multimedia.service';
import { PeliculaSavePayload, PeliculasModalComponent } from './peliculas-modal.component';
import { PeliculasTableComponent } from './peliculas-table.component';

@Component({
  selector: 'app-peliculas',
  standalone: true,
  imports: [CommonModule, PeliculasTableComponent, PeliculasModalComponent],
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

      <app-peliculas-table
        [items]="paginatedItems"
        [currentPage]="currentPage"
        [totalPages]="totalPages"
        (edit)="edit($event)"
        (remove)="remove($event)"
        (prevPage)="prevPage()"
        (nextPage)="nextPage()"
      />
    </div>

    <app-peliculas-modal
      [visible]="showModal"
      [pelicula]="editingPelicula"
      [saving]="saving"
      (closed)="closeModal()"
      (saved)="save($event)"
    />
  `
})
export class PeliculasComponent implements OnInit {
  private readonly cinema = inject(CinemaCoreService);
  private readonly multimedia = inject(MultimediaService);
  readonly pageSize = 10;
  peliculas: Pelicula[] = [];
  currentPage = 1;
  editingPelicula: Pelicula | null = null;
  showModal = false;
  saving = false;
  error = '';

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
    this.editingPelicula = null;
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingPelicula = null;
  }

  edit(pelicula: Pelicula): void {
    this.editingPelicula = pelicula;
    this.showModal = true;
  }

  save(payload: PeliculaSavePayload): void {
    this.saving = true;
    this.error = '';
    const { formValue, posterFile, editingId } = payload;

    const persist = (posterUrl: string | null) => {
      const input = {
        ...(editingId ? { id: editingId } : {}),
        titulo: formValue.titulo,
        tituloOriginal: formValue.tituloOriginal || null,
        duracionMinutos: formValue.duracionMinutos,
        sinopsis: formValue.sinopsis || null,
        clasificacion: formValue.clasificacion || null,
        generos: [formValue.generoPrincipal],
        fechaEstreno: formValue.fechaEstreno || null,
        estado: formValue.estado,
        posterUrl,
        trailerUrl: formValue.trailerUrl || null,
        director: formValue.director || null
      };
      return editingId
        ? this.cinema.actualizarPelicula(input)
        : this.cinema.crearPelicula(input);
    };

    const upload$ = posterFile
      ? this.multimedia.uploadPoster(posterFile, editingId ?? undefined)
      : null;

    const request$ = upload$
      ? upload$.pipe(switchMap((response) => persist(response.url)))
      : persist(formValue.posterUrl || null);

    request$.subscribe({
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
