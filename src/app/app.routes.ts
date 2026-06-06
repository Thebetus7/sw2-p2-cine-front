import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { AdminShellComponent } from './layout/admin-shell/admin-shell.component';
import { PeliculasComponent } from './features/peliculas/peliculas.component';
import { ProgramacionComponent } from './features/programacion/programacion.component';
import { PromocionesComponent } from './features/promociones/promociones.component';
import { ReservasComponent } from './features/reservas/reservas.component';
import { SalasComponent } from './features/salas/salas.component';
import { SucursalesComponent } from './features/sucursales/sucursales.component';

export const routes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'sucursales' },
      { path: 'sucursales', component: SucursalesComponent, title: 'Sucursales' },
      { path: 'salas', component: SalasComponent, title: 'Salas' },
      { path: 'peliculas', component: PeliculasComponent, title: 'Peliculas' },
      { path: 'promociones', component: PromocionesComponent, title: 'Promociones' },
      { path: 'programacion', component: ProgramacionComponent, title: 'Programacion' },
      { path: 'reservas', component: ReservasComponent, title: 'Reservas' }
    ]
  },
  { path: '**', redirectTo: 'sucursales' }
];
