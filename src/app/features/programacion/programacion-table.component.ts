import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProgramacionRow } from '../../core/models/cinema.models';

@Component({
  selector: 'app-programacion-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="panel">
      <h2>Funciones programadas</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Pelicula</th>
              <th>Sala</th>
              <th>Sucursal</th>
              <th>Inicio</th>
              <th>Fin</th>
              <th>Idioma</th>
              <th>Precio</th>
              <th>Butacas</th>
              <th>Estado</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (row of items; track row.funcion.id) {
              <tr>
                <td><strong>{{ row.peliculaTitulo }}</strong></td>
                <td>{{ row.salaNombre }}</td>
                <td>{{ row.sucursalNombre || '-' }}</td>
                <td>{{ row.funcion.fechaHoraIni | date:'short' }}</td>
                <td>{{ row.funcion.fechaHoraFin | date:'short' }}</td>
                <td>{{ row.funcion.idioma }}</td>
                <td>{{ row.funcion.precioBase | number:'1.2-2' }} Bs</td>
                <td>{{ row.funcion.butacasDisponibles ?? '-' }}</td>
                <td><span class="status ok">{{ row.funcion.estado }}</span></td>
                <td class="actions">
                  <button type="button" class="ghost" (click)="viewDetail.emit(row.funcion.id)">Detalle</button>
                </td>
              </tr>
            } @empty {
              <tr><td colspan="10" class="muted">Sin funciones programadas.</td></tr>
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
export class ProgramacionTableComponent {
  @Input({ required: true }) items: ProgramacionRow[] = [];
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) totalPages = 1;
  @Output() viewDetail = new EventEmitter<string>();
  @Output() prevPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
}
