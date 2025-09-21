import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface DashboardStats {
  characters: number;
  transformations: number;
  sagas: number;
  episodes: number;
}

@Injectable({ providedIn: 'root' })
export class StatsService {
  // Ajusta la base URL según el proxy que configuraste (/backend → tu servidor Django)
  private readonly baseUrl = '/backend/api/statistics';

  constructor(private readonly http: HttpClient) {}

  /** Obtiene las estadísticas para el dashboard */
  public getDashboardStats(): Observable<DashboardStats> {
    // Conecta a /backend/api/statistics/dashboard/
    return this.http.get<DashboardStats>(`${this.baseUrl}/dashboard/`);
  }
}
