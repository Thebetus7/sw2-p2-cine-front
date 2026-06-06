import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { GraphqlService } from '../graphql/graphql.service';
import { Pelicula, Promocion, Sala, Sucursal } from '../models/cinema.models';

type Input = Record<string, unknown>;

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
