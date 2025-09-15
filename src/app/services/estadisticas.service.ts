import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface PersonajeStats {
  nombre: string;
  base_ki: number;
  total_ki: number;
}

@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  // ahora pasa por el proxy hacia Django
  private baseUrl = '/backend/api/personajes';

  constructor(private http: HttpClient) {}

  getEstadisticas(): Observable<Record<string, PersonajeStats[]>> {
    return this.http.get<Record<string, PersonajeStats[]>>(
      `${this.baseUrl}/estadisticas/`
    );
  }
}
