import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Pelicula } from '../../core/models/cinema.models';

@Component({
  selector: 'app-peliculas-table',
  standalone: true,
  imports: [CommonModule],
  styles: [`
    .poster-thumb {
      width: 48px;
      height: 72px;
      object-fit: cover;
      border-radius: 4px;
      background: #1a1a2e;
    }
  `],
  template: `
    <section class="panel">
      <h2>Catalogo</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Portada</th><th>Pelicula</th><th>Estado</th><th>Genero</th><th>Duracion</th><th>Director</th><th></th></tr>
          </thead>
          <tbody>
            @for (pelicula of items; track pelicula.id) {
              <tr>
                <td>
                  @if (pelicula.posterUrl) {
                    <img [src]="pelicula.posterUrl" [alt]="pelicula.titulo" class="poster-thumb" />
                  } @else {
                    <span class="muted">Sin poster</span>
                  }
                </td>
                <td>
                  <strong>{{ pelicula.titulo }}</strong><br>
                  <span class="muted">{{ pelicula.clasificacion || '-' }}</span>
                </td>
                <td><span class="status ok">{{ pelicula.estado }}</span></td>
                <td>{{ pelicula.generos.join(', ') }}</td>
                <td>{{ pelicula.duracionMinutos }} min</td>
                <td>{{ pelicula.director || '-' }}</td>
                <td class="actions">
                  <button type="button" class="ghost" (click)="edit.emit(pelicula)">Editar</button>
                  <button type="button" class="danger" (click)="remove.emit(pelicula)">Eliminar</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="7" class="muted">Sin peliculas registradas.</td></tr>
            }
          </tbody>
        </table>
      </div>
      @if (totalPages > 1) {
        <div class="pagination">
          <button type="button" class="ghost" [disabled]="currentPage === 1" (click)="prevPage.emit()">Anterior</button>
          <span class="muted">Pagina {{ currentPage }} de {{ totalPages }}</span>
          <button type="button" class="ghost" [disabled]="currentPage === totalPages" (click)="nextPage.emit()">Siguiente</button>
        </div>
      }
    </section>
  `
})
export class PeliculasTableComponent {
  @Input({ required: true }) items: Pelicula[] = [];
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) totalPages = 1;
  @Output() edit = new EventEmitter<Pelicula>();
  @Output() remove = new EventEmitter<Pelicula>();
  @Output() prevPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
}
