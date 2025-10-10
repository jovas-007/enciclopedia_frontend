import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { EpisodiosService, Episodio } from '../../services/episodios.service';
import { Saga, SagasService } from 'src/app/services/sagas.service';

type Orden = 'natural' | 'az' | 'za';

@Component({
  selector: 'app-episodios-screen',
  templateUrl: './episodios-screen.component.html',
  styleUrls: ['./episodios-screen.component.scss'],
})
export class EpisodiosScreenComponent implements OnInit {
  /* ===== Estado base ===== */
  public isLoading = true;

  /** Texto del buscador */
  public query = '';

  /** Orden actual del <select> (Bootstrap) */
  public ordenActual: Orden = 'natural';

  /** Fuente inmutable en orden cronológico (natural) */
  private allSagas: Saga[] = [];

  /** Lista mostrada (ya filtrada/ordenada/paginada) */
  public sagas: Saga[] = [];

  /* ===== Paginación (Angular Material) ===== */
  public totalItems = 0; // total tras filtro/orden
  public pageIndex = 0; // 0-based
  public pageSize = 12;
  public pageSizeOptions: number[] = [12, 24, 36];

  /* ===== Estado por SAGA para episodios ===== */
  /** sagaName -> lista de episodios mostrables en el panel */
  public episodiosPorSaga: Record<string, Episodio[]> = {}; // Cambié `number` a `string` para usar el nombre de la saga
  /** sagaName -> bandera de carga perezosa */
  public loadingEpisodios: Record<string, boolean> = {}; // Cambié `number` a `string` para usar el nombre de la saga

  constructor(
    private readonly sagasService: SagasService,
    private readonly episodiosService: EpisodiosService
  ) {}

  /* =============== Ciclo de vida =============== */
  ngOnInit(): void {
    // Carga inicial en orden cronológico natural
    this.allSagas = this.sagasService.getAllSagas();
    this.applyFiltersSortPaginate(true); // Aplica filtro, orden y paginación al cargar los datos
    this.isLoading = false; // Termina la carga
  }

  /* =============== Handlers UI =============== */

  /** Cambio de orden desde el <select> Bootstrap */
  public onOrdenChange(valor: string): void {
    // Normalizamos a nuestro union type
    const v = (['natural', 'az', 'za'] as Orden[]).includes(valor as Orden)
      ? (valor as Orden)
      : 'natural';

    this.ordenActual = v;
    this.pageIndex = 0; // vuelves a la primera página
    this.applyFiltersSortPaginate(true); // Reaplica el filtro, orden y paginación
  }

  /** Cambio del paginador */
  public onPageChange(ev: PageEvent): void {
    this.pageIndex = ev.pageIndex;
    this.pageSize = ev.pageSize;
    this.applyFiltersSortPaginate(false); // Solo aplicamos filtros y paginación sin reiniciar el índice
  }

  /** Buscador */
  public onSearch(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.query = (input?.value ?? '').trim();
    this.pageIndex = 0; // Vuelve a la primera página cuando se realice una nueva búsqueda
    this.applyFiltersSortPaginate(true); // Aplica nuevamente el filtro
  }

  /** trackBy para el *ngFor */
  public trackBySagaId(_: number, s: Saga): number | string {
    return s.id ?? s.name; // Usamos `s.id` como identificador único, si no `s.name`
  }

  /* =============== Carga perezosa al abrir panel =============== */
  /** Se llama desde el HTML: (opened)="onSagaOpened(s)" */
  public onSagaOpened(s: Saga): void {
    // Verificamos si ya se cargaron los episodios de esta saga
    // Usamos `s.name` como clave en lugar de `s.id`
    if (this.episodiosPorSaga[s.name] || this.loadingEpisodios[s.name]) return;

    this.loadingEpisodios[s.name] = true; // Establecemos que estamos cargando los episodios

    // Si no hay un nombre de saga (esto debería ser muy raro, pero por precaución)
    if (!s.name) {
      this.episodiosPorSaga[s.name] = []; // no hay nombre para consultar
      this.loadingEpisodios[s.name] = false;
      return;
    }

    // Llamamos al servicio con el nombre de la saga, ya que estamos trabajando con nombres en lugar de IDs
    this.episodiosService.getEpisodiosBySaga(s.name).subscribe({
      next: (episodios) => {
        console.log(`Episodios cargados para la saga "${s.name}":`, episodios);

        this.episodiosPorSaga[s.name] = episodios; // Asignamos los episodios a la saga por nombre
      },
      error: () => {
        this.episodiosPorSaga[s.name] = []; // En caso de error, asignamos una lista vacía
      },
      complete: () => {
        this.loadingEpisodios[s.name] = false; // Terminamos de cargar
      },
    });
  }

  /* =============== trackBy de episodios =============== */
  public trackByEp = (_: number, ep: Episodio) => ep.id ?? ep.nombre;

  /* =============== Builder de URLs DBZLatino =============== */
  /** Devuelve la URL al capítulo si existe en DBZLatino. Para Dragon Ball (clásico) devuelve null. */
  public buildDbLatinoUrl(serie: Saga['series'], epId: number): string | null {
    switch (serie) {
      case 'Dragon Ball Z':
        return `https://dbzlatino.com/dragon-ball-z-capitulo-${epId}/`;
      case 'Dragon Ball GT':
        return `https://dbzlatino.com/dragon-ball-gt-capitulo-${epId}/`;
      case 'Dragon Ball Super':
        return `https://dbzlatino.com/dragon-ball-super-capitulo-${epId}/`;
      default:
        return null; // Dragon Ball clásico (sin enlaces allí)
    }
  }

  /* ======== Filtrar + Ordenar + Paginar ======== */
  private applyFiltersSortPaginate(resetIndex: boolean): void {
    // 1) Filtrado por texto (nombre o serie)
    let list = this.allSagas;
    if (this.query) {
      const q = this.query.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.series?.toLowerCase().includes(q) ?? false)
      );
    }

    // 2) Orden
    switch (this.ordenActual) {
      case 'natural':
        list = [...list]; // tal cual llega del servicio (cronológico)
        break;
      case 'az':
        list = [...list].sort((a, b) =>
          a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
        );
        break;
      case 'za':
        list = [...list].sort((a, b) =>
          b.name.localeCompare(a.name, 'es', { sensitivity: 'base' })
        );
        break;
    }

    // 3) Totales
    this.totalItems = list.length;

    // 4) Ajuste de pageIndex si cambió algo
    const totalPages = Math.max(1, Math.ceil(this.totalItems / this.pageSize));
    if (resetIndex) {
      this.pageIndex = 0;
    } else if (this.pageIndex > totalPages - 1) {
      this.pageIndex = totalPages - 1;
    }

    // 5) Slice de la página actual
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.sagas = list.slice(start, end);
  }
}
