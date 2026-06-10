import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ESTADOS_SALA, EstadoSala, Sala, Sucursal, TIPOS_SALA, TipoSala } from '../../core/models/cinema.models';

export interface SalaFormValue {
  nombre: string;
  tipo: TipoSala;
  capacidadTotal: number;
  estado: EstadoSala;
  idSucursal: string;
}

@Component({
  selector: 'app-salas-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (visible) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal" role="dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingId ? 'Editar sala' : 'Crear sala' }}</h2>
            <button type="button" class="ghost" (click)="close()">Cerrar</button>
          </div>
          <form [formGroup]="form" class="grid three" (ngSubmit)="submit()">
            <input formControlName="nombre" placeholder="Nombre" />
            <select formControlName="idSucursal">
              <option value="">Sucursal</option>
              @for (sucursal of sucursales; track sucursal.id) {
                <option [value]="sucursal.id">{{ sucursal.nombre }}</option>
              }
            </select>
            <select formControlName="tipo">
              @for (tipo of tipos; track tipo) {
                <option [value]="tipo">{{ tipo }}</option>
              }
            </select>
            <input formControlName="capacidadTotal" type="number" min="0" placeholder="Capacidad" />
            <select formControlName="estado">
              @for (estado of estados; track estado) {
                <option [value]="estado">{{ estado }}</option>
              }
            </select>
            <div class="actions">
              <button type="submit" [disabled]="form.invalid || saving">Guardar</button>
              <button type="button" class="ghost" (click)="close()">Cancelar</button>
            </div>
          </form>
        </div>
      </div>
    }
  `
})
export class SalasModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  readonly tipos = TIPOS_SALA;
  readonly estados = ESTADOS_SALA;

  @Input() visible = false;
  @Input() sala: Sala | null = null;
  @Input() sucursales: Sucursal[] = [];
  @Input() saving = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<{ formValue: SalaFormValue; editingId: string | null }>();

  editingId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    tipo: ['FORMATO_2D' as TipoSala, Validators.required],
    capacidadTotal: [0, [Validators.required, Validators.min(0)]],
    estado: ['DISPONIBLE' as EstadoSala, Validators.required],
    idSucursal: ['', Validators.required]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue || changes['sala']) {
      this.patchForm();
    }
  }

  close(): void {
    this.resetForm();
    this.closed.emit();
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }
    this.saved.emit({
      formValue: this.form.getRawValue(),
      editingId: this.editingId
    });
  }

  private patchForm(): void {
    if (!this.visible) {
      return;
    }
    if (this.sala) {
      this.editingId = this.sala.id;
      this.form.setValue({
        nombre: this.sala.nombre,
        tipo: this.sala.tipo,
        capacidadTotal: this.sala.capacidadTotal,
        estado: this.sala.estado,
        idSucursal: this.sala.idSucursal
      });
      return;
    }
    this.resetForm();
  }

  private resetForm(): void {
    this.editingId = null;
    this.form.reset({
      nombre: '',
      tipo: 'FORMATO_2D',
      capacidadTotal: 0,
      estado: 'DISPONIBLE',
      idSucursal: ''
    });
  }
}
