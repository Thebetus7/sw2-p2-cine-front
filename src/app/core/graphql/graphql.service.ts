import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

interface GraphqlError {
  message: string;
}

interface GraphqlResponse<T> {
  data?: T;
  errors?: GraphqlError[];
}

@Injectable({ providedIn: 'root' })
export class GraphqlService {
  constructor(private readonly http: HttpClient) {}

  request<T>(query: string, variables: Record<string, unknown> = {}): Observable<T> {
    return this.http.post<GraphqlResponse<T>>(environment.graphqlUrl, { query, variables }).pipe(
      map((response) => {
        if (response.errors?.length) {
          throw new Error(response.errors.map((error) => error.message).join('\n'));
        }
        if (!response.data) {
          throw new Error('La respuesta GraphQL no contiene data.');
        }
        return response.data;
      })
    );
  }
}
