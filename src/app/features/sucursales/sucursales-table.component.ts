import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Sucursal } from '../../core/models/cinema.models';

@Component({
  selector: 'app-sucursales-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="panel">
      <h2>Listado</h2>
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Nombre</th><th>Ciudad</th><th>Horario</th><th>Contacto</th><th>Estado</th><th></th></tr>
          </thead>
          <tbody>
            @for (sucursal of items; track sucursal.id) {
              <tr>
                <td>{{ sucursal.nombre }}</td>
                <td>{{ sucursal.ciudad }}<br><span class="muted">{{ sucursal.direccion }}</span></td>
                <td>{{ sucursal.horaApertura }} - {{ sucursal.horaCierre }}</td>
                <td>{{ sucursal.telefono || '-' }}<br><span class="muted">{{ sucursal.email || '-' }}</span></td>
                <td><span class="status ok">{{ sucursal.estado }}</span></td>
                <td><button type="button" class="ghost" (click)="edit.emit(sucursal)">Editar</button></td>
              </tr>
            } @empty {
              <tr><td colspan="6" class="muted">Sin sucursales registradas.</td></tr>
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
export class SucursalesTableComponent {
  @Input({ required: true }) items: Sucursal[] = [];
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) totalPages = 1;
  @Output() edit = new EventEmitter<Sucursal>();
  @Output() prevPage = new EventEmitter<void>();
  @Output() nextPage = new EventEmitter<void>();
}
