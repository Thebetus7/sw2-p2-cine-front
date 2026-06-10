import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ESTADOS_PELICULA, EstadoPelicula, GENEROS_PELICULA, GeneroPelicula, Pelicula } from '../../core/models/cinema.models';
import { MultimediaService } from '../../core/services/multimedia.service';

export interface PeliculaSavePayload {
  formValue: {
    titulo: string;
    tituloOriginal: string;
    duracionMinutos: number;
    sinopsis: string;
    clasificacion: string;
    generoPrincipal: GeneroPelicula;
    fechaEstreno: string;
    estado: EstadoPelicula;
    posterUrl: string;
    trailerUrl: string;
    director: string;
  };
  posterFile: File | null;
  editingId: string | null;
}

@Component({
  selector: 'app-peliculas-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    .poster-preview {
      width: 120px;
      height: 180px;
      object-fit: cover;
      border-radius: 6px;
      background: #1a1a2e;
    }
    .poster-field {
      grid-column: span 3;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .verify-ok { color: #22c55e; }
    .verify-fail { color: #ef4444; }
  `],
  template: `
    @if (visible) {
      <div class="modal-overlay" (click)="close()">
        <div class="modal" role="dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>{{ editingId ? 'Editar pelicula' : 'Crear pelicula' }}</h2>
            <button type="button" class="ghost" (click)="close()">Cerrar</button>
          </div>
          <form [formGroup]="form" class="grid three" (ngSubmit)="submit()">
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
            <div class="poster-field">
              <label>Poster (S3 / MinIO)</label>
              <input type="file" accept="image/*" (change)="onPosterSelected($event)" />
              @if (posterPreviewUrl) {
                <img [src]="posterPreviewUrl" alt="Vista previa del poster" class="poster-preview" />
              }
              @if (editingId && form.controls.posterUrl.value) {
                <button type="button" class="ghost" (click)="verifyPosterIntegrity()">Verificar integridad</button>
              }
              @if (verifyMessage) {
                <span [class]="verifyOk ? 'verify-ok' : 'verify-fail'">{{ verifyMessage }}</span>
              }
            </div>
            <input formControlName="trailerUrl" placeholder="Trailer URL" />
            <select formControlName="generoPrincipal">
              @for (genero of generos; track genero) {
                <option [value]="genero">{{ genero }}</option>
              }
            </select>
            <textarea formControlName="sinopsis" placeholder="Sinopsis"></textarea>
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
export class PeliculasModalComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly multimedia = inject(MultimediaService);
  readonly estados = ESTADOS_PELICULA;
  readonly generos = GENEROS_PELICULA;

  @Input() visible = false;
  @Input() pelicula: Pelicula | null = null;
  @Input() saving = false;
  @Output() closed = new EventEmitter<void>();
  @Output() saved = new EventEmitter<PeliculaSavePayload>();

  editingId: string | null = null;
  selectedPosterFile: File | null = null;
  posterPreviewUrl = '';
  verifyMessage = '';
  verifyOk = false;

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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible']?.currentValue || changes['pelicula']) {
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
      posterFile: this.selectedPosterFile,
      editingId: this.editingId
    });
  }

  onPosterSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }
    this.selectedPosterFile = file;
    this.posterPreviewUrl = URL.createObjectURL(file);
    this.verifyMessage = '';
    this.verifyOk = false;
  }

  verifyPosterIntegrity(): void {
    const posterId = this.multimedia.extractPosterIdFromUrl(this.form.controls.posterUrl.value);
    if (!posterId) {
      this.verifyMessage = 'No hay poster almacenado en multimedia-back para verificar.';
      this.verifyOk = false;
      return;
    }
    this.multimedia.verifyPoster(posterId).subscribe({
      next: (result) => {
        this.verifyOk = result.valid;
        this.verifyMessage = result.message ?? (result.valid ? 'Integridad OK' : 'Integridad comprometida');
      },
      error: (error: Error) => {
        this.verifyOk = false;
        this.verifyMessage = error.message;
      }
    });
  }

  private patchForm(): void {
    if (!this.visible) {
      return;
    }
    if (this.pelicula) {
      this.editingId = this.pelicula.id;
      this.selectedPosterFile = null;
      this.posterPreviewUrl = this.pelicula.posterUrl ?? '';
      this.verifyMessage = '';
      this.verifyOk = false;
      this.form.setValue({
        titulo: this.pelicula.titulo,
        tituloOriginal: this.pelicula.tituloOriginal ?? '',
        duracionMinutos: this.pelicula.duracionMinutos,
        sinopsis: this.pelicula.sinopsis ?? '',
        clasificacion: this.pelicula.clasificacion ?? '',
        generoPrincipal: this.pelicula.generos[0] ?? 'ACCION',
        fechaEstreno: this.pelicula.fechaEstreno ?? '',
        estado: this.pelicula.estado,
        posterUrl: this.pelicula.posterUrl ?? '',
        trailerUrl: this.pelicula.trailerUrl ?? '',
        director: this.pelicula.director ?? ''
      });
      return;
    }
    this.resetForm();
  }

  private resetForm(): void {
    this.editingId = null;
    this.selectedPosterFile = null;
    this.posterPreviewUrl = '';
    this.verifyMessage = '';
    this.verifyOk = false;
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
}
