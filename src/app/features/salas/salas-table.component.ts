import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Sala, Sucursal } from '../../core/models/cinema.models';

@Component({
  selector: 'app-salas-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="panel">
      <div class="page-header">
        <div>
          <h2>Listado</h2>
          <p>Filtra por sucursal para revisar capacidad y estado.</p>
        </div>
        <select [value]="filterSucursal" (change)="filterChange.emit(($any($event.target)).value)">
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
            @for (sala of items; track sala.id) {
              <tr>
                <td>{{ sala.nombre }}</td>
                <td>{{ sucursalNombre(sala.idSucursal) }}</td>
                <td><span class="tag">{{ sala.tipo }}</span></td>
                <td>{{ sala.capacidadTotal }}</td>
                <td><span class="status ok">{{ sala.estado }}</span></td>
                <td><button type="button" class="ghost" (click)="edit.emit(sala)">Editar</button></td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="muted">Sin salas registradas.</td></tr>
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
export class SalasTableComponent {
  @Input({ required: true }) items: Sala[] = [];
  @Input({ required: true }) sucursales: Sucursal[] = [];
  @Input({ required: true }) filterSucursal = '';
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) totalPages = 1;
  @Output() filterChange = new EventEmitter<string>();
  @Output() edit = new EventEmitter<Sala>();
  @Output() prevPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();

  sucursalNombre(idSucursal: string): string {
    return this.sucursales.find((item) => item.id === idSucursal)?.nombre ?? idSucursal;
  }
}
