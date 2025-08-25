import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Personaje {
  id?: number;
  nombre: string;
  especie: string;
  genero: string;
  base_ki: number;
  total_ki: number;
  afiliacion: string;
  descripcion?: string;
  imagen?: string | null;      // ruta del archivo (si se sube)
  imagen_url?: string;         // URL externa opcional
  imagen_src?: string | null;  // URL final resuelta por el backend
}

interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({ providedIn: 'root' })
export class PersonajesLocalService {
  /** Utiliza el prefijo /backend para redirigir al backend de Django en desarrollo (configurado en proxy.conf.json) */
private base = '/backend/api/personajes/';

  constructor(private http: HttpClient) {}

  /** Lista personajes con filtros/opciones opcionales */
  list(params?: Record<string, any>): Observable<Page<Personaje>> {
    let p = new HttpParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== null && v !== undefined && v !== '') p = p.set(k, v as string);
      });
    }
    return this.http.get<Page<Personaje>>(this.base, { params: p });
  }

  /** Obtiene un personaje concreto */
  get(id: number): Observable<Personaje> {
    return this.http.get<Personaje>(`${this.base}${id}/`);
  }

  /** Crea un personaje enviando JSON (cuando sólo hay URL de imagen externa) */
  createJSON(data: Partial<Personaje>): Observable<Personaje> {
    return this.http.post<Personaje>(this.base, data);
  }

  /** Crea un personaje con archivo (usa multipart/form-data) */
  createForm(data: Partial<Personaje>, file: File): Observable<Personaje> {
    const fd = this.toFormData(data, file);
    return this.http.post<Personaje>(this.base, fd);
  }

  /** Actualiza parcialmente un personaje enviando JSON */
  updateJSON(id: number, data: Partial<Personaje>): Observable<Personaje> {
    return this.http.patch<Personaje>(`${this.base}${id}/`, data);
  }

  /** Actualiza con archivo opcional */
  updateForm(id: number, data: Partial<Personaje>, file?: File): Observable<Personaje> {
    const fd = this.toFormData(data, file);
    return this.http.patch<Personaje>(`${this.base}${id}/`, fd);
  }

  /** Elimina un personaje */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}${id}/`);
  }

  /** Compara dos personajes devolviendo ambos objetos y sus diferencias de Ki */
  compare(a: number, b: number) {
    return this.http.get<{ personajes: Personaje[]; comparacion: any }>(
      `${this.base}comparar/`,
      { params: new HttpParams().set('ids', `${a},${b}`) }
    );
  }

  private toFormData(data: Partial<Personaje>, file?: File): FormData {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (v !== undefined && v !== null) fd.append(k, String(v));
    });
    if (file) fd.append('imagen', file);
    return fd;
  }
}
