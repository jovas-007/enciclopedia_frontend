import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface Personaje {
  id: number;
  name: string;
  ki: string;
  maxKi: string;
  race: string;
  gender: string;
  affiliation: string;
  description: string;
  image: string;
  // se pueden añadir meta o links si se necesitan más adelante
}

export interface ApiResponse {
  items: Personaje[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
  links: {
    first: string;
    previous: string;
    next: string;
    last: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class PersonajesService {

  /** Base URL de la API DBZ */
  /** Prefijo proxy a /api para evitar CORS en desarrollo */
  private readonly API_URL = '/api';

  constructor(private readonly http: HttpClient) {}

  /**
   * Obtiene la lista completa de personajes desde
   * https://dragonball-api.com/api/characters?limit=1000
   * y extrae el array que está en `items`.
   */
  public obtenerPersonajes(limit: number = 1000): Observable<Personaje[]> {
    return this.http
      .get<ApiResponse>(`${this.API_URL}/characters?limit=${limit}`)
      .pipe(
        map(response => response.items || [])
      );
  }

  /**
   * Si necesitamos paginar manualmente, podrías usar esto:
   */
  public obtenerPersonajesConMeta(limit = 100, page = 1): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(
      `${this.API_URL}/characters?limit=${limit}&page=${page}`
    );
  }
}
