import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ESTADOS_SUCURSAL, EstadoSucursal, Sucursal } from '../../core/models/cinema.models';

export interface SucursalFormValue {
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono: string;
  email: string;
  horaApertura: string;
  horaCierre: string;
  estado: EstadoSucursal;
}

@Component({
  selector: 'app-sucursales-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    @if (visible) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal" role="dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingId ? 'Editar sucursal' : 'Crear sucursal' }}</h2>
            <button type="button" class="ghost" (click)="close()">Cerrar</button>
          </div>
          <form [formGroup]="form" class="grid three" (ngSubmit)="submit()">
            <input formControlName="nombre" placeholder="Nombre" />
            <input formControlName="ciudad" placeholder="Ciudad" />
            <input formControlName="direccion" placeholder="Direccion" />
            <input formControlName="telefono" placeholder="Telefono" />
            <input formControlName="email" placeholder="Email" />
            <select formControlName="estado">
              @for (estado of estados; track estado) {
                <option [value]="estado">{{ estado }}</option>
              }
            </select>
            <input formControlName="horaApertura" type="time" />
            <input formControlName="horaCierre" type="time" />
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
export class SucursalesModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  readonly estados = ESTADOS_SUCURSAL;

  @Input() visible = false;
  @Input() sucursal: Sucursal | null = null;
  @Input() saving = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<{ formValue: SucursalFormValue; editingId: string | null }>();

  editingId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    nombre: ['', Validators.required],
    direccion: ['', Validators.required],
    ciudad: ['', Validators.required],
    telefono: [''],
    email: [''],
    horaApertura: ['09:00', Validators.required],
    horaCierre: ['23:30', Validators.required],
    estado: ['ABIERTA' as EstadoSucursal, Validators.required]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue || changes['sucursal']) {
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
    if (this.sucursal) {
      this.editingId = this.sucursal.id;
      this.form.setValue({
        nombre: this.sucursal.nombre,
        direccion: this.sucursal.direccion,
        ciudad: this.sucursal.ciudad,
        telefono: this.sucursal.telefono ?? '',
        email: this.sucursal.email ?? '',
        horaApertura: this.sucursal.horaApertura,
        horaCierre: this.sucursal.horaCierre,
        estado: this.sucursal.estado
      });
      return;
    }
    this.resetForm();
  }

  private resetForm(): void {
    this.editingId = null;
    this.form.reset({
      nombre: '',
      direccion: '',
      ciudad: '',
      telefono: '',
      email: '',
      horaApertura: '09:00',
      horaCierre: '23:30',
      estado: 'ABIERTA'
    });
  }
}
