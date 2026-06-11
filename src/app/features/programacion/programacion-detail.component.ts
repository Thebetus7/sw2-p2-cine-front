import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ProgramacionDetalle } from '../../core/models/cinema.models';

@Component({
  selector: 'app-programacion-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (visible && detalle) {
      <div class="modal-overlay" (click)="closed.emit()">
        <div class="modal" role="dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Detalle de programacion</h2>
            <button type="button" class="ghost" (click)="closed.emit()">Cerrar</button>
          </div>
          <div class="grid three">
            <div>
              <h3>Pelicula</h3>
              <p><strong>{{ detalle.pelicula.titulo }}</strong></p>
              <p class="muted">{{ detalle.pelicula.estado }} · {{ detalle.pelicula.duracionMinutos }} min</p>
              <p class="muted">{{ detalle.pelicula.director || 'Sin director' }}</p>
            </div>
            <div>
              <h3>Sala y sucursal</h3>
              <p><strong>{{ detalle.sala.nombre }}</strong> ({{ detalle.sala.tipo }})</p>
              <p class="muted">Capacidad: {{ detalle.sala.capacidadTotal }}</p>
              <p class="muted">{{ detalle.sucursal?.nombre || 'Sucursal no disponible' }}</p>
              <p class="muted">{{ detalle.sucursal?.ciudad || '' }}</p>
            </div>
            <div>
              <h3>Funcion</h3>
              <p>Inicio: {{ detalle.funcion.fechaHoraIni | date:'medium' }}</p>
              <p>Fin: {{ detalle.funcion.fechaHoraFin | date:'medium' }}</p>
              <p>Idioma: {{ detalle.funcion.idioma }}</p>
              <p>Estado: {{ detalle.funcion.estado }}</p>
              <p>Precio base: {{ detalle.funcion.precioBase | number:'1.2-2' }} Bs</p>
              <p>Butacas disp.: {{ detalle.funcion.butacasDisponibles ?? '-' }}</p>
            </div>
            @if (detalle.resumenButacas) {
              <div>
                <h3>Butacas en sala</h3>
                <p>Total: {{ detalle.resumenButacas.total }}</p>
                <p>Disponibles: {{ detalle.resumenButacas.disponibles }}</p>
                <p>Ocupadas: {{ detalle.resumenButacas.ocupadas }}</p>
                <p>Reservadas: {{ detalle.resumenButacas.reservadas }}</p>
              </div>
            }
            @if (detalle.cartelera) {
              <div>
                <h3>Cartelera vinculada</h3>
                <p>{{ detalle.cartelera.titulo }}</p>
                <p class="muted">{{ detalle.cartelera.fecha }} {{ detalle.cartelera.hora }}</p>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class ProgramacionDetailComponent {
  @Input() visible = false;
  @Input() detalle: ProgramacionDetalle | null = null;
  @Output() closed = new EventEmitter<void>();
}
