import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

/**
 * Interfaz que describe la forma de los datos
 * que devuelve el endpoint /dashboard.
 */
export interface DashboardStats {
  /** Número total de personajes */
  characters: number;
  /** Número total de transformaciones */
  transformations: number;
  /** Número total de sagas */
  sagas: number;
  /** Número total de episodios */
  episodes: number;
}

@Injectable({
  providedIn: 'root'
})
export class StatsService {

  /** URL base para los endpoints de estadísticas */
  private readonly baseUrl: string = '/api/statistics';

  constructor(
    private readonly http: HttpClient
  ) {}

  /**
   * Obtiene las estadísticas para el dashboard.
   * Llama a GET /api/statistics/dashboard
   */
  public getDashboardStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard`);
  }
}
