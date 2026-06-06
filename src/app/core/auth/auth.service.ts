import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const TOKEN_KEY = 'cine_admin_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSubject = new BehaviorSubject<string | null>(localStorage.getItem(TOKEN_KEY));
  readonly token$ = this.tokenSubject.asObservable();

  get token(): string | null {
    return this.tokenSubject.value;
  }

  setToken(token: string): void {
    const cleanToken = token.trim();
    if (!cleanToken) {
      this.clearToken();
      return;
    }
    localStorage.setItem(TOKEN_KEY, cleanToken);
    this.tokenSubject.next(cleanToken);
  }

  clearToken(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.tokenSubject.next(null);
  }
}
