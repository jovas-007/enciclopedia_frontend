// services/transformaciones.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';

/** ===== Tipos que usará el componente ===== */
export interface Transformacion { id: number; name: string; }
export interface Personaje {
  id: number;
  name: string;
  race: string;
  gender: string;
  image: string;
  transformations: Transformacion[];
}

/** Meta + respuesta genérica (lo que espera tu TS) */
export interface ApiMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
}
export interface ApiResponse<T> { items: T[]; meta: ApiMeta; }

/** Respuesta DBZ pública */
interface DbzApiCharacter {
  id: number; name: string; race: string; gender: string; image: string;
}
interface DbzApiResponse {
  items: DbzApiCharacter[];
  meta: ApiMeta;
  links: any;
}

@Injectable({ providedIn: 'root' })
export class TransformacionesService {
  // API pública (solo para demo)
  private readonly DBZ_PUBLIC = 'https://dragonball-api.com/api/characters';

  // Backend real (ajusta con environment)
  private readonly BACKEND_BASE = '/api';
  private readonly BACKEND_TRANSF = `${this.BACKEND_BASE}/personajes/with-transformations`;

  constructor(private http: HttpClient) {}

  /**
   * DEMO: trae personajes de la API pública y les genera transformaciones dummy.
   * Devuelve un ApiResponse<Personaje> para que sea plug & play con tu componente.
   */
  getPersonajesConTransformaciones(opts: {
    page: number;       // 1-based
    limit: number;
    search?: string;
    race?: string;
  }): Observable<ApiResponse<Personaje>> {
    let params = new HttpParams()
      .set('limit', opts.limit)
      .set('page',  opts.page);

    return this.http.get<DbzApiResponse>(this.DBZ_PUBLIC, { params }).pipe(
      map(resp => {
        // Filtrado básico en cliente (opcional)
        let rows = resp.items;
        if (opts.search) {
          const q = opts.search.toLowerCase();
          rows = rows.filter(c => c.name.toLowerCase().includes(q) || c.race.toLowerCase().includes(q));
        }
        if (opts.race) {
          rows = rows.filter(c => c.race === opts.race);
        }

        const items: Personaje[] = rows.map(c => ({
          id: c.id,
          name: c.name,
          race: c.race,
          gender: c.gender,
          image: c.image,
          transformations: this.mockTransfs(c)   // genera chips de demo
        }));

        const meta: ApiMeta = {
          totalItems: rows.length,
          itemCount: rows.length,
          itemsPerPage: opts.limit,
          totalPages: Math.max(1, Math.ceil(rows.length / Math.max(1, opts.limit))),
          currentPage: opts.page
        };

        return { items, meta };
      })
    );
  }

  /** REAL: cuando tengas Django, usa esto (mismo shape ApiResponse<Personaje>) */
  getPersonajesConTransformacionesBackend(opts: {
    page: number; limit: number; search?: string; race?: string;
    orderBy?: 'name'|'ki'|'transformations'; orderDir?: 'asc'|'desc';
  }): Observable<ApiResponse<Personaje>> {
    let params = new HttpParams()
      .set('page',  opts.page)
      .set('pageSize', opts.limit);
    if (opts.search)   params = params.set('search', opts.search);
    if (opts.race)     params = params.set('race', opts.race);
    if (opts.orderBy)  params = params.set('orderBy', opts.orderBy);
    if (opts.orderDir) params = params.set('orderDir', opts.orderDir);

    return this.http.get<ApiResponse<Personaje>>(this.BACKEND_TRANSF, { params });
  }

  // ===== helper demo =====
  private mockTransfs(c: DbzApiCharacter): Transformacion[] {
    const T = (n: string, i: number) => ({ id: Number(`${c.id}${i}`), name: n });
    switch (c.race) {
      case 'Saiyan':       return [T('Super Saiyan',1), T('Super Saiyan 2',2), T('Super Saiyan 3',3)];
      case 'Frieza Race':  return [T('Final Form',1), T('Golden Form',2)];
      case 'Namekian':     return [T('Potential Unleashed',1)];
      case 'Android':      return [T('Overclock',1)];
      case 'Majin':        return [T('Absorbed Form',1)];
      case 'God':          return [T('Hakai Surge',1)];
      default:             return [T('Forma Potenciada',1)];
    }
  }
}
