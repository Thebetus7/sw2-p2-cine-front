import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PosterUploadResponse {
  id: string;
  url: string;
  sha256: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  peliculaId?: string | null;
  createdAt: string;
}

export interface PosterVerifyResponse {
  valid: boolean;
  posterId: string;
  blockIndex?: number;
  expectedHash?: string;
  actualHash?: string;
  blockHash?: string;
  message?: string;
}

@Injectable({ providedIn: 'root' })
export class MultimediaService {
  constructor(private readonly http: HttpClient) {}

  uploadPoster(file: File, peliculaId?: string): Observable<PosterUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (peliculaId) {
      formData.append('peliculaId', peliculaId);
    }
    return this.http.post<PosterUploadResponse>(`${environment.multimediaUrl}/api/posters`, formData);
  }

  verifyPoster(id: string): Observable<PosterVerifyResponse> {
    return this.http.get<PosterVerifyResponse>(`${environment.multimediaUrl}/api/posters/${id}/verify`);
  }

  extractPosterIdFromUrl(url: string | null | undefined): string | null {
    if (!url) {
      return null;
    }
    const match = url.match(/\/api\/posters\/([^/]+)\/file$/);
    return match?.[1] ?? null;
  }
}
