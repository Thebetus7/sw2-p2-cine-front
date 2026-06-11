export type EstadoSucursal = 'ABIERTA' | 'CERRADA_TEMPORAL' | 'EN_CONSTRUCCION';
export type TipoSala = 'FORMATO_2D' | 'FORMATO_3D' | 'FORMATO_4DX' | 'IMAX' | 'VIP' | 'PLATINUM';
export type EstadoSala = 'DISPONIBLE' | 'MANTENIMIENTO' | 'INACTIVA';
export type GeneroPelicula = 'ACCION' | 'AVENTURA' | 'ANIMACION' | 'COMEDIA' | 'DRAMA' | 'TERROR' | 'FANTASIA' | 'CIENCIA_FICCION' | 'ROMANCE' | 'DOCUMENTAL' | 'MUSICAL' | 'THRILLER' | 'INFANTIL' | 'OTRO';
export type EstadoPelicula = 'CARTELERA' | 'PROXIMAMENTE' | 'RETIRADA';
export type EstadoFuncion = 'PROGRAMADA' | 'EN_CURSO' | 'FINALIZADA' | 'CANCELADA' | 'SUSPENDIDA';
export type EstadoButaca = 'DISPONIBLE' | 'RESERVADA' | 'OCUPADA' | 'BLOQUEADA' | 'MANTENIMIENTO';
export type TipoPromocion = 'PORCENTAJE' | 'MONTO_FIJO' | 'DOS_X_UNO' | 'CODIGO_DESCUENTO' | 'COMBO';

export const ESTADOS_SUCURSAL: EstadoSucursal[] = ['ABIERTA', 'CERRADA_TEMPORAL', 'EN_CONSTRUCCION'];
export const TIPOS_SALA: TipoSala[] = ['FORMATO_2D', 'FORMATO_3D', 'FORMATO_4DX', 'IMAX', 'VIP', 'PLATINUM'];
export const ESTADOS_SALA: EstadoSala[] = ['DISPONIBLE', 'MANTENIMIENTO', 'INACTIVA'];
export const GENEROS_PELICULA: GeneroPelicula[] = ['ACCION', 'AVENTURA', 'ANIMACION', 'COMEDIA', 'DRAMA', 'TERROR', 'FANTASIA', 'CIENCIA_FICCION', 'ROMANCE', 'DOCUMENTAL', 'MUSICAL', 'THRILLER', 'INFANTIL', 'OTRO'];
export const ESTADOS_PELICULA: EstadoPelicula[] = ['CARTELERA', 'PROXIMAMENTE', 'RETIRADA'];
export const ESTADOS_FUNCION: EstadoFuncion[] = ['PROGRAMADA', 'EN_CURSO', 'FINALIZADA', 'CANCELADA', 'SUSPENDIDA'];
export const TIPOS_PROMOCION: TipoPromocion[] = ['PORCENTAJE', 'MONTO_FIJO', 'DOS_X_UNO', 'CODIGO_DESCUENTO', 'COMBO'];

export interface Sucursal {
  id: string;
  nombre: string;
  direccion: string;
  ciudad: string;
  telefono?: string | null;
  email?: string | null;
  horaApertura: string;
  horaCierre: string;
  estado: EstadoSucursal;
}

export interface Sala {
  id: string;
  nombre: string;
  tipo: TipoSala;
  capacidadTotal: number;
  estado: EstadoSala;
  idSucursal: string;
}

export interface Pelicula {
  id: string;
  titulo: string;
  tituloOriginal?: string | null;
  duracionMinutos: number;
  sinopsis?: string | null;
  clasificacion?: string | null;
  generos: GeneroPelicula[];
  fechaEstreno?: string | null;
  estado: EstadoPelicula;
  posterUrl?: string | null;
  trailerUrl?: string | null;
  director?: string | null;
}

export interface Promocion {
  id: string;
  nombre: string;
  descripcion?: string | null;
  tipo: TipoPromocion;
  montoFijo?: number | null;
  fechaDescuento?: string | null;
}

export interface Funcion {
  id: string;
  fechaHoraIni: string;
  fechaHoraFin: string;
  precioBase: number;
  precioVip?: number | null;
  precioPreferente?: number | null;
  idioma: string;
  estado: EstadoFuncion;
  butacasDisponibles?: number | null;
  idSala: string;
  idCartelera?: string | null;
  idPelicula: string;
}

export interface ResumenButacasSala {
  idSala: string;
  total: number;
  disponibles: number;
  reservadas: number;
  ocupadas: number;
  bloqueadas: number;
  mantenimiento: number;
}

export interface Cartelera {
  id: string;
  fecha: string;
  hora: string;
  titulo: string;
  estado: string;
  salaNombre: string;
  butacasDisponibles?: number | null;
  precio: number;
  tienePromo: boolean;
}

export interface FuncionPromocion {
  id: string;
  descuentoPromocional?: number | null;
  precioPromocional?: number | null;
  activo: boolean;
  idFuncion: string;
  idPromocion: string;
}

export interface ProgramacionDetalle {
  funcion: Funcion;
  pelicula: Pelicula;
  sala: Sala;
  sucursal?: Sucursal | null;
  cartelera?: Cartelera | null;
  promociones: FuncionPromocion[];
  resumenButacas?: ResumenButacasSala | null;
}

export interface ProgramacionRow {
  funcion: Funcion;
  peliculaTitulo: string;
  salaNombre: string;
  sucursalNombre: string;
}
