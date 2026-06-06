import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss'
})
export class AdminShellComponent {
  readonly auth = inject(AuthService);
  readonly graphqlUrl = environment.graphqlUrl;
  tokenDraft = this.auth.token ?? '';

  readonly navItems = [
    { label: 'Sucursales', path: '/sucursales', icon: 'SC' },
    { label: 'Salas', path: '/salas', icon: 'SL' },
    { label: 'Peliculas', path: '/peliculas', icon: 'PL' },
    { label: 'Promociones', path: '/promociones', icon: 'PR' },
    { label: 'Programacion', path: '/programacion', icon: 'PG' },
    { label: 'Reservas', path: '/reservas', icon: 'RV' }
  ];

  saveToken(): void {
    this.auth.setToken(this.tokenDraft);
  }

  clearToken(): void {
    this.tokenDraft = '';
    this.auth.clearToken();
  }
}
