import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface SagaArc {
  name: string;
  episodeStart?: number;
  episodeEnd?: number;
}

export interface Saga {
  id: number;
  series?: 'Dragon Ball' | 'Dragon Ball Z' | 'Dragon Ball GT' | 'Dragon Ball Super';
  name: string;
  episodeStart: number;   // numeración interna de la serie (reinicia por serie)
  episodeEnd: number;
  summary?: string;
  season?: string | number;
  year?: number;
  arcs?: SagaArc[];
}

export interface PagedResponse<T> {
  items: T[];
  totalItems: number;
}

@Injectable({ providedIn: 'root' })
export class SagasService {

  /** Catálogo local ampliado (DB, DBZ, GT, Super) */
  private readonly SAGAS: Saga[] = [
    /* =======================
       DRAGON BALL (Gokū niño)
       Serie: 153 episodios
       ======================= */
    {
      id: 101,
      series: 'Dragon Ball',
      name: 'Emperador Pilaf',
      episodeStart: 1,
      episodeEnd: 13,
      summary: 'Inicio del viaje de Gokū y Bulma para reunir las esferas del dragón; primer antagonista: Pilaf.',
      season: 1,
      year: 1986,
      arcs: [
        { name: 'Encuentro con Bulma', episodeStart: 1, episodeEnd: 2 },
        { name: 'Oolong y el Monte Fry-pan', episodeStart: 3, episodeEnd: 8 },
        { name: 'Pilaf y la primera invocación', episodeStart: 9, episodeEnd: 13 }
      ]
    },
    {
      id: 102,
      series: 'Dragon Ball',
      name: '21.º Tenkaichi Budōkai',
      episodeStart: 14,
      episodeEnd: 28,
      summary: 'Gokū y Krilin entrenan con el Maestro Roshi y participan en su primer torneo mundial.',
      season: 1,
      year: 1986
    },
    {
      id: 103,
      series: 'Dragon Ball',
      name: 'Ejército Red Ribbon',
      episodeStart: 29,
      episodeEnd: 68,
      summary: 'Gokū enfrenta a la Red Ribbon en la búsqueda de las esferas; introduce a personajes como el General Blue.',
      season: 2,
      year: 1986,
      arcs: [
        { name: 'General Silver', episodeStart: 29, episodeEnd: 33 },
        { name: 'General White (Muscle Tower)', episodeStart: 34, episodeEnd: 45 },
        { name: 'General Blue', episodeStart: 46, episodeEnd: 57 },
        { name: 'General Red', episodeStart: 58, episodeEnd: 68 }
      ]
    },
    {
      id: 104,
      series: 'Dragon Ball',
      name: '22.º Tenkaichi Budōkai',
      episodeStart: 69,
      episodeEnd: 83,
      summary: 'Segundo torneo mundial, destacando la rivalidad con el dojo de Tsuru (Ten Shin Han y Chaoz).',
      season: 2,
      year: 1987
    },
    {
      id: 105,
      series: 'Dragon Ball',
      name: 'Piccolo Daimaō',
      episodeStart: 84,
      episodeEnd: 122,
      summary: 'Resurrección de Piccolo Daimaō y batalla por salvar el mundo.',
      season: 3,
      year: 1988
    },
    {
      id: 106,
      series: 'Dragon Ball',
      name: '23.º Tenkaichi Budōkai',
      episodeStart: 123,
      episodeEnd: 153,
      summary: 'Tercer torneo: Gokū vs. Piccolo Jr.; cierre de la etapa infantil y puente hacia DBZ.',
      season: 3,
      year: 1989
    },

    /* =======================
       DRAGON BALL Z (1–291)
       ======================= */
    {
      id: 1,
      series: 'Dragon Ball Z',
      name: 'Saga Saiyan',
      episodeStart: 1,
      episodeEnd: 35,
      summary: 'Llegada de Raditz, Nappa y Vegeta; formación de los Guerreros Z.',
      season: 1,
      year: 1989,
      arcs: [
        { name: 'Raditz', episodeStart: 1, episodeEnd: 6 },
        { name: 'Entrenamiento y Kaio', episodeStart: 7, episodeEnd: 17 },
        { name: 'Nappa y Vegeta', episodeStart: 18, episodeEnd: 35 }
      ]
    },
    {
      id: 2,
      series: 'Dragon Ball Z',
      name: 'Saga Namek/Freezer',
      episodeStart: 36,
      episodeEnd: 107,
      summary: 'Viaje a Namek; combate contra las Fuerzas Ginyū y Freezer.',
      season: 2,
      year: 1990,
      arcs: [
        { name: 'Llegada a Namek', episodeStart: 36, episodeEnd: 60 },
        { name: 'Fuerzas Ginyū', episodeStart: 61, episodeEnd: 74 },
        { name: 'Freezer', episodeStart: 75, episodeEnd: 107 }
      ]
    },
    {
      id: 3,
      series: 'Dragon Ball Z',
      name: 'Garlic Jr. (relleno)',
      episodeStart: 108,
      episodeEnd: 117,
      summary: 'Retorno de Garlic Jr. y la Niebla del Agua Negra.',
      season: 3,
      year: 1991
    },
    {
      id: 4,
      series: 'Dragon Ball Z',
      name: 'Saga de los Androides',
      episodeStart: 118,
      episodeEnd: 139,
      summary: 'Aparición de Trunks del futuro y androides 19/20/17/18.',
      season: 3,
      year: 1991
    },
    {
      id: 5,
      series: 'Dragon Ball Z',
      name: 'Saga de Cell',
      episodeStart: 140,
      episodeEnd: 165,
      summary: 'Evolución de Cell hasta su forma perfecta y Juegos de Cell.',
      season: 4,
      year: 1992
    },
    {
      id: 6,
      series: 'Dragon Ball Z',
      name: 'Gran Saiyaman y Torneo Mundial',
      episodeStart: 166,
      episodeEnd: 194,
      summary: 'Vida escolar de Gohan y nuevo torneo de artes marciales.',
      season: 5,
      year: 1993
    },
    {
      id: 7,
      series: 'Dragon Ball Z',
      name: 'Saga de Babidi',
      episodeStart: 195,
      episodeEnd: 219,
      summary: 'Babidi busca revivir a Majin Buu recolectando energía.',
      season: 6,
      year: 1994
    },
    {
      id: 8,
      series: 'Dragon Ball Z',
      name: 'Saga de Majin Buu',
      episodeStart: 220,
      episodeEnd: 253,
      summary: 'Aparición y evolución de Majin Buu; múltiples batallas.',
      season: 6,
      year: 1994
    },
    {
      id: 9,
      series: 'Dragon Ball Z',
      name: 'Saga de la Fusión',
      episodeStart: 254,
      episodeEnd: 275,
      summary: 'Gotenks y Vegetto entran en acción para enfrentar a Buu.',
      season: 7,
      year: 1995
    },
    {
      id: 10,
      series: 'Dragon Ball Z',
      name: 'Saga de Kid Buu',
      episodeStart: 276,
      episodeEnd: 291,
      summary: 'Batalla final contra Kid Buu y cierre de DBZ.',
      season: 7,
      year: 1996
    },

    /* =======================
       DRAGON BALL GT (1–64)
       ======================= */
    {
      id: 201,
      series: 'Dragon Ball GT',
      name: 'Esferas del Dragón de Estrellas Negras',
      episodeStart: 1,
      episodeEnd: 16,
      summary: 'Gokū niño viaja por el espacio para recuperar las esferas antes de que la Tierra explote.',
      season: 1,
      year: 1996
    },
    {
      id: 202,
      series: 'Dragon Ball GT',
      name: 'Saga de Baby',
      episodeStart: 17,
      episodeEnd: 40,
      summary: 'El parásito Tuffle, Baby, busca venganza y domina cuerpos para conquistar la Tierra.',
      season: 1,
      year: 1996,
      arcs: [
        { name: 'Infiltración de Baby', episodeStart: 17, episodeEnd: 29 },
        { name: 'Baby Vegeta', episodeStart: 30, episodeEnd: 40 }
      ]
    },
    {
      id: 203,
      series: 'Dragon Ball GT',
      name: 'Super N°17',
      episodeStart: 41,
      episodeEnd: 47,
      summary: 'Fusión de N°17 y Hell Fighter N°17 que crea a Super 17.',
      season: 2,
      year: 1997
    },
    {
      id: 204,
      series: 'Dragon Ball GT',
      name: 'Dragones Oscuros',
      episodeStart: 48,
      episodeEnd: 64,
      summary: 'Nacen los Siete Dragones Oscuros por el abuso de las esferas; combate final de GT.',
      season: 2,
      year: 1997
    },

    /* =======================
       DRAGON BALL SUPER (1–131)
       ======================= */
    {
      id: 301,
      series: 'Dragon Ball Super',
      name: 'Batalla de los Dioses',
      episodeStart: 1,
      episodeEnd: 14,
      summary: 'Aparición de Bills, el Dios de la Destrucción; Gokū alcanza el SSJ Dios.',
      season: 1,
      year: 2015
    },
    {
      id: 302,
      series: 'Dragon Ball Super',
      name: 'La Resurrección de Freezer',
      episodeStart: 15,
      episodeEnd: 27,
      summary: 'Freezer es resucitado; Gokū y Vegeta entrenan con Whis.',
      season: 1,
      year: 2015
    },
    {
      id: 303,
      series: 'Dragon Ball Super',
      name: 'Torneo del Universo 6',
      episodeStart: 28,
      episodeEnd: 46,
      summary: 'Torneo amistoso entre los Universos 6 y 7 organizado por Champa.',
      season: 1,
      year: 2016
    },
    {
      id: 304,
      series: 'Dragon Ball Super',
      name: 'Trunks del Futuro / Goku Black',
      episodeStart: 47,
      episodeEnd: 76,
      summary: 'Amenaza de Goku Black y Zamasu; viajes temporales y fusión.',
      season: 2,
      year: 2016
    },
    {
      id: 305,
      series: 'Dragon Ball Super',
      name: 'Supervivencia Universal (Torneo del Poder)',
      episodeStart: 77,
      episodeEnd: 131,
      summary: 'Torneo entre múltiples universos con existencia en juego; Gokū alcanza el Ultra Instinto.',
      season: 3,
      year: 2017
    }
  ];

  private readonly indexMap: Record<number, number> =
    this.SAGAS.reduce((acc, s, i) => {
      acc[s.id] = i;
      return acc;
    }, {} as Record<number, number>);

  constructor() {}

  /** Devuelve todo el catálogo (útil para dropdowns, etc.) */
  getAll(): Observable<Saga[]> {
    return of([...this.SAGAS]);
  }

  /**
   * Devuelve el catálogo en **orden cronológico** (DB → DBZ → GT → DBS).
   * Úsalo cuando quieras respetar el orden natural.
   */
  getAllSagas(): Saga[] {
    return this.SAGAS;
  }

  /**
   * Variante reactiva por si prefieres Observables.
   */
  getAllSagas$(): Observable<Saga[]> {
    return of(this.SAGAS);
  }

  /**
   * Consulta con búsqueda/orden/paginación en cliente.
   * @param params page (1-based), pageSize, search (por nombre), order 'az'|'za'
   */
  getPaged(params: {
    page: number;
    pageSize: number;
    search?: string;
    order?: 'chrono' | 'az' | 'za';
  }): Observable<PagedResponse<Saga>> {
    const page = Math.max(1, params.page);
    const size = Math.max(1, params.pageSize);
    const order = params.order ?? 'chrono';

    // 1) Partimos SIEMPRE del catálogo en el orden original
    let rows = [...this.SAGAS];

    // 2) Filtro (preserva el orden de inserción)
    if (params.search) {
      const q = params.search.trim().toLowerCase();
      rows = rows.filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.series ? s.series.toLowerCase().includes(q) : false)
      );
    }

    // 3) Orden
    if (order === 'az' || order === 'za') {
      // Orden alfabético (si se elige), puede mantener agrupación por serie si lo desea.
      rows = [...rows].sort((a, b) => {
        // (Opcional) priorizar serie para consistencia visual:
        const bySeries = (a.series ?? '').localeCompare(b.series ?? '', 'es');
        if (bySeries !== 0) return bySeries;
        return order === 'az'
          ? a.name.localeCompare(b.name, 'es')
          : b.name.localeCompare(a.name, 'es');
      });
    } else {
      // 'chrono' ⇒ EXACTAMENTE el orden del catálogo.
      // No hacemos sort. Si quisiera forzar por seguridad:
      // rows.sort((a, b) => this.indexMap[a.id] - this.indexMap[b.id]);
    }

    // 4) Paginación
    const totalItems = rows.length;
    const start = (page - 1) * size;
    const end   = start + size;
    const items = rows.slice(start, end);

    return of({ items, totalItems });
  }
}
