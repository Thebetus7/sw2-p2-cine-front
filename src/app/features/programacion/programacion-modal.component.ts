import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ESTADOS_FUNCION, EstadoFuncion, Pelicula, Sala } from '../../core/models/cinema.models';

export interface ProgramacionFormValue {
  idPelicula: string;
  idSala: string;
  fecha: string;
  hora: string;
  idioma: string;
  precioBase: number;
  precioVip: number;
  precioPreferente: number;
  estado: EstadoFuncion;
}

export interface ProgramacionSavePayload {
  formValue: ProgramacionFormValue;
  pelicula: Pelicula;
  sala: Sala;
}

@Component({
  selector: 'app-programacion-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (visible) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal" role="dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Nueva programacion</h2>
            <button type="button" class="ghost" (click)="close()">Cerrar</button>
          </div>
          <form [formGroup]="form" class="grid three" (ngSubmit)="submit()">
            <select formControlName="idPelicula">
              <option value="">Pelicula</option>
              @for (pelicula of peliculas; track pelicula.id) {
                <option [value]="pelicula.id">{{ pelicula.titulo }} ({{ pelicula.estado }})</option>
              }
            </select>
            <select formControlName="idSala">
              <option value="">Sala</option>
              @for (sala of salas; track sala.id) {
                <option [value]="sala.id">{{ sala.nombre }} - cap. {{ sala.capacidadTotal }}</option>
              }
            </select>
            <input formControlName="fecha" type="date" />
            <input formControlName="hora" type="time" />
            <input formControlName="idioma" placeholder="Idioma" />
            <input formControlName="precioBase" type="number" min="0" step="0.5" placeholder="Precio base" />
            <input formControlName="precioVip" type="number" min="0" step="0.5" placeholder="Precio VIP" />
            <input formControlName="precioPreferente" type="number" min="0" step="0.5" placeholder="Precio preferente" />
            <select formControlName="estado">
              @for (estado of estados; track estado) {
                <option [value]="estado">{{ estado }}</option>
              }
            </select>
            @if (duracionLabel) {
              <p class="muted">Duracion estimada: {{ duracionLabel }}</p>
            }
            <div class="actions">
              <button type="submit" [disabled]="form.invalid || saving || !peliculas.length || !salas.length">Guardar</button>
              <button type="button" class="ghost" (click)="close()">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class ProgramacionModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  readonly estados = ESTADOS_FUNCION;

  @Input() visible = false;
  @Input() peliculas: Pelicula[] = [];
  @Input() salas: Sala[] = [];
  @Input() saving = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<ProgramacionSavePayload>();

  duracionLabel = '';

  readonly form = this.fb.nonNullable.group({
    idPelicula: ['', Validators.required],
    idSala: ['', Validators.required],
    fecha: ['', Validators.required],
    hora: ['', Validators.required],
    idioma: ['Español (Doblada)', Validators.required],
    precioBase: [45, [Validators.required, Validators.min(0)]],
    precioVip: [67.5, [Validators.required, Validators.min(0)]],
    precioPreferente: [56.25, [Validators.required, Validators.min(0)]],
    estado: ['PROGRAMADA' as EstadoFuncion, Validators.required]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue) {
      this.resetForm();
    }
    this.updateDuracionLabel();
  }

  close(): void {
    this.closed.emit();
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    const formValue = this.form.getRawValue();
    const pelicula = this.peliculas.find((p) => p.id === formValue.idPelicula);
    const sala = this.salas.find((s) => s.id === formValue.idSala);
    if (!pelicula || !sala) {
      return;
    }
    this.saved.emit({ formValue, pelicula, sala });
  }

  private resetForm(): void {
    const today = new Date().toISOString().slice(0, 10);
    this.form.reset({
      idPelicula: '',
      idSala: '',
      fecha: today,
      hora: '18:00',
      idioma: 'Español (Doblada)',
      precioBase: 45,
      precioVip: 67.5,
      precioPreferente: 56.25,
      estado: 'PROGRAMADA'
    });
    this.updateDuracionLabel();
  }

  private updateDuracionLabel(): void {
    const pelicula = this.peliculas.find((p) => p.id === this.form.controls.idPelicula.value);
    this.duracionLabel = pelicula ? `${pelicula.duracionMinutos} min` : '';
  }
}
