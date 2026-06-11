import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphqlService } from '../graphql/graphql.service';
import {
  Funcion,
  Pelicula,
  ProgramacionDetalle,
  Promocion,
  ResumenButacasSala,
  Sala,
  Sucursal
} from '../models/cinema.models';

type Input = Record<string, unknown>;

const FUNCION_FIELDS = `
  id fechaHoraIni fechaHoraFin precioBase precioVip precioPreferente
  idioma estado butacasDisponibles idSala idCartelera idPelicula
`;

const PROGRAMACION_DETALLE_FIELDS = `
  funcion { ${FUNCION_FIELDS} }
  pelicula { id titulo duracionMinutos estado clasificacion generos director }
  sala { id nombre tipo capacidadTotal estado idSucursal }
  sucursal { id nombre ciudad direccion }
  cartelera { id fecha hora titulo estado salaNombre precio tienePromo }
  promociones { id descuentoPromocional precioPromocional activo idFuncion idPromocion }
  resumenButacas { idSala total disponibles reservadas ocupadas bloqueadas mantenimiento }
`;

@Injectable({ providedIn: 'root' })
export class CinemaCoreService {
  constructor(private readonly graphql: GraphqlService) {}

  getSucursales(): Observable<Sucursal[]> {
    return this.graphql.request<{ sucursales: Sucursal[] }>(`
      query Sucursales {
        sucursales { id nombre direccion ciudad telefono email horaApertura horaCierre estado }
      }
    `).pipe(map((data) => data.sucursales));
  }

  crearSucursal(input: Input): Observable<Sucursal> {
    return this.graphql.request<{ crearSucursal: Sucursal }>(`
      mutation CrearSucursal($input: CrearSucursalInput!) {
        crearSucursal(input: $input) { id nombre direccion ciudad telefono email horaApertura horaCierre estado }
      }
    `, { input }).pipe(map((data) => data.crearSucursal));
  }

  actualizarSucursal(input: Input): Observable<Sucursal> {
    return this.graphql.request<{ actualizarSucursal: Sucursal }>(`
      mutation ActualizarSucursal($input: ActualizarSucursalInput!) {
        actualizarSucursal(input: $input) { id nombre direccion ciudad telefono email horaApertura horaCierre estado }
      }
    `, { input }).pipe(map((data) => data.actualizarSucursal));
  }

  getSalas(): Observable<Sala[]> {
    return this.graphql.request<{ salas: Sala[] }>(`
      query Salas {
        salas { id nombre tipo capacidadTotal estado idSucursal }
      }
    `).pipe(map((data) => data.salas));
  }

  getSalasDisponibles(): Observable<Sala[]> {
    return this.graphql.request<{ salasDisponibles: Sala[] }>(`
      query SalasDisponibles {
        salasDisponibles { id nombre tipo capacidadTotal estado idSucursal }
      }
    `).pipe(map((data) => data.salasDisponibles));
  }

  getSalasPorSucursal(idSucursal: string): Observable<Sala[]> {
    return this.graphql.request<{ salasPorSucursal: Sala[] }>(`
      query SalasPorSucursal($idSucursal: ID!) {
        salasPorSucursal(idSucursal: $idSucursal) { id nombre tipo capacidadTotal estado idSucursal }
      }
    `, { idSucursal }).pipe(map((data) => data.salasPorSucursal));
  }

  crearSala(input: Input): Observable<Sala> {
    return this.graphql.request<{ crearSala: Sala }>(`
      mutation CrearSala($input: CrearSalaInput!) {
        crearSala(input: $input) { id nombre tipo capacidadTotal estado idSucursal }
      }
    `, { input }).pipe(map((data) => data.crearSala));
  }

  actualizarSala(input: Input): Observable<Sala> {
    return this.graphql.request<{ actualizarSala: Sala }>(`
      mutation ActualizarSala($input: ActualizarSalaInput!) {
        actualizarSala(input: $input) { id nombre tipo capacidadTotal estado idSucursal }
      }
    `, { input }).pipe(map((data) => data.actualizarSala));
  }

  getPeliculas(): Observable<Pelicula[]> {
    return this.graphql.request<{ peliculas: Pelicula[] }>(`
      query Peliculas {
        peliculas { id titulo tituloOriginal duracionMinutos sinopsis clasificacion generos fechaEstreno estado posterUrl trailerUrl director }
      }
    `).pipe(map((data) => data.peliculas));
  }

  getPeliculasProgramables(): Observable<Pelicula[]> {
    return this.graphql.request<{ peliculasProgramables: Pelicula[] }>(`
      query PeliculasProgramables {
        peliculasProgramables { id titulo duracionMinutos estado clasificacion generos director }
      }
    `).pipe(map((data) => data.peliculasProgramables));
  }

  crearPelicula(input: Input): Observable<Pelicula> {
    return this.graphql.request<{ crearPelicula: Pelicula }>(`
      mutation CrearPelicula($input: CrearPeliculaInput!) {
        crearPelicula(input: $input) { id titulo tituloOriginal duracionMinutos sinopsis clasificacion generos fechaEstreno estado posterUrl trailerUrl director }
      }
    `, { input }).pipe(map((data) => data.crearPelicula));
  }

  actualizarPelicula(input: Input): Observable<Pelicula> {
    return this.graphql.request<{ actualizarPelicula: Pelicula }>(`
      mutation ActualizarPelicula($input: ActualizarPeliculaInput!) {
        actualizarPelicula(input: $input) { id titulo tituloOriginal duracionMinutos sinopsis clasificacion generos fechaEstreno estado posterUrl trailerUrl director }
      }
    `, { input }).pipe(map((data) => data.actualizarPelicula));
  }

  eliminarPelicula(id: string): Observable<boolean> {
    return this.graphql.request<{ eliminarPelicula: boolean }>(`
      mutation EliminarPelicula($id: ID!) { eliminarPelicula(id: $id) }
    `, { id }).pipe(map((data) => data.eliminarPelicula));
  }

  sembrarPeliculasPrueba(cantidad: number): Observable<number> {
    return this.graphql.request<{ sembrarPeliculasPrueba: number }>(`
      mutation SembrarPeliculas($cantidad: Int!) { sembrarPeliculasPrueba(cantidad: $cantidad) }
    `, { cantidad }).pipe(map((data) => data.sembrarPeliculasPrueba));
  }

  getFunciones(): Observable<Funcion[]> {
    return this.graphql.request<{ funciones: Funcion[] }>(`
      query Funciones { funciones { ${FUNCION_FIELDS} } }
    `).pipe(map((data) => data.funciones));
  }

  getProgramacionDetalle(idFuncion: string): Observable<ProgramacionDetalle> {
    return this.graphql.request<{ programacionDetalle: ProgramacionDetalle }>(`
      query ProgramacionDetalle($idFuncion: ID!) {
        programacionDetalle(idFuncion: $idFuncion) { ${PROGRAMACION_DETALLE_FIELDS} }
      }
    `, { idFuncion }).pipe(map((data) => data.programacionDetalle));
  }

  crearFuncion(input: Input): Observable<Funcion> {
    return this.graphql.request<{ crearFuncion: Funcion }>(`
      mutation CrearFuncion($input: CrearFuncionInput!) {
        crearFuncion(input: $input) { ${FUNCION_FIELDS} }
      }
    `, { input }).pipe(map((data) => data.crearFuncion));
  }

  sembrarFuncionesPrueba(cantidad: number): Observable<number> {
    return this.graphql.request<{ sembrarFuncionesPrueba: number }>(`
      mutation SembrarFunciones($cantidad: Int!) { sembrarFuncionesPrueba(cantidad: $cantidad) }
    `, { cantidad }).pipe(map((data) => data.sembrarFuncionesPrueba));
  }

  getResumenButacasPorSala(idSala: string): Observable<ResumenButacasSala> {
    return this.graphql.request<{ resumenButacasPorSala: ResumenButacasSala }>(`
      query ResumenButacas($idSala: ID!) {
        resumenButacasPorSala(idSala: $idSala) {
          idSala total disponibles reservadas ocupadas bloqueadas mantenimiento
        }
      }
    `, { idSala }).pipe(map((data) => data.resumenButacasPorSala));
  }

  getPromociones(): Observable<Promocion[]> {
    return this.graphql.request<{ promociones: Promocion[] }>(`
      query Promociones {
        promociones { id nombre descripcion tipo montoFijo fechaDescuento }
      }
    `).pipe(map((data) => data.promociones));
  }

  crearPromocion(input: Input): Observable<Promocion> {
    return this.graphql.request<{ crearPromocion: Promocion }>(`
      mutation CrearPromocion($input: CrearPromocionInput!) {
        crearPromocion(input: $input) { id nombre descripcion tipo montoFijo fechaDescuento }
      }
    `, { input }).pipe(map((data) => data.crearPromocion));
  }

  actualizarPromocion(input: Input): Observable<Promocion> {
    return this.graphql.request<{ actualizarPromocion: Promocion }>(`
      mutation ActualizarPromocion($input: ActualizarPromocionInput!) {
        actualizarPromocion(input: $input) { id nombre descripcion tipo montoFijo fechaDescuento }
      }
    `, { input }).pipe(map((data) => data.actualizarPromocion));
  }

  eliminarPromocion(id: string): Observable<boolean> {
    return this.graphql.request<{ eliminarPromocion: boolean }>(`
      mutation EliminarPromocion($id: ID!) { eliminarPromocion(id: $id) }
    `, { id }).pipe(map((data) => data.eliminarPromocion));
  }
}
