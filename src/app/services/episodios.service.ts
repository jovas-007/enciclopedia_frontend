/* src/app/services/episodios.service.ts */
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

/* ===== Interfaces ===== */
export interface Episodio {
  id: number;
  nombre: string;
  saga: string;
  arco: string;
  numero: number;
  url: string;
  update: string | null;
}

/* ===== Servicio ===== */
@Injectable({
  providedIn: 'root',
})
export class EpisodiosService {
  
  private base = '/backend/api/episodios';

  constructor(private http: HttpClient) {}

  /** Obtiene episodios de una saga desde la API (backend Django) */
  getEpisodiosBySaga(sagaName: string): Observable<Episodio[]> {
    // Construye la ruta añadiendo el parámetro sagaId codificado
    const url = `${this.base}?sagaId=${encodeURIComponent(sagaName)}`;
    return this.http.get<Episodio[]>(url);
  }
}
