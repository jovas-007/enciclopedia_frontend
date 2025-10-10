// src/app/services/episodios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment'; // Importa el archivo environment

/* ===== Interfaces ===== */
export interface Episodio {
  id: number;
  nombre: string;       // Nombre del episodio
  saga: string;         // Saga a la que pertenece
  arco: string;         // Arco de la saga
  numero: number;       // Número del episodio
  url: string;          // Enlace al episodio
  update: string | null; // Información sobre la actualización (si aplica)
}

/* ===== Servicio ===== */
@Injectable({
  providedIn: 'root',
})
export class EpisodiosService {

  // URL de la API obtenida desde el archivo environment.ts
  private readonly apiUrl = `${environment.url_api}/api`;

  constructor(private http: HttpClient) {}

  /** Obtiene episodios de una saga desde la API (backend Django) */
  getEpisodiosBySaga(sagaName: string): Observable<Episodio[]> {
    // Asegúrate de que la URL esté bien formada sin duplicación de 'episodios'
    const url = `${this.apiUrl}/episodios?sagaId=${encodeURIComponent(sagaName)}`;
    return this.http.get<Episodio[]>(url);
  }
}
