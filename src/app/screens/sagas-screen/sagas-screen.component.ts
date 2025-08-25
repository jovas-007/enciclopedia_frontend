// sagas-screen.component.ts
import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { SagasService, Saga } from '../../services/sagas.service';

export type Orden = 'natural' | 'az' | 'za';

@Component({
  selector: 'app-sagas-screen',
  templateUrl: './sagas-screen.component.html',
  styleUrls: ['./sagas-screen.component.scss'],
})
export class SagasScreenComponent implements OnInit {
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
  public totalItems = 0;        // total tras filtro/orden
  public pageIndex = 0;         // 0-based
  public pageSize  = 12;
  public pageSizeOptions: number[] = [12, 24, 36];

  constructor(private readonly sagasService: SagasService) {}

  /* =============== Ciclo de vida =============== */
  ngOnInit(): void {
    // Carga inicial en orden cronológico natural
    this.allSagas = this.sagasService.getAllSagas();
    this.applyFiltersSortPaginate(true);
    this.isLoading = false;
  }

  /* =============== Handlers UI =============== */

  /** Cambio de orden desde el <select> Bootstrap */
  public onOrdenChange(valor: string): void {
    // Normalizamos a nuestro union type
    const v = (['natural', 'az', 'za'] as Orden[]).includes(valor as Orden)
      ? (valor as Orden)
      : 'natural';

    this.ordenActual = v;
    this.pageIndex = 0;                 // vuelves a la primera página
    this.applyFiltersSortPaginate(true);
  }

  /** Cambio del paginador */
  public onPageChange(ev: PageEvent): void {
    this.pageIndex = ev.pageIndex;
    this.pageSize  = ev.pageSize;
    this.applyFiltersSortPaginate(false);
  }

  /** Buscador */
  public onSearch(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    this.query = (input?.value ?? '').trim();
    this.pageIndex = 0;
    this.applyFiltersSortPaginate(true);
  }

  /** trackBy para el *ngFor */
  public trackBySagaId(_: number, s: Saga): number | string {
    return s.id ?? s.name;
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
        // tal cual llega del servicio (cronológico)
        list = [...list];
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
    const end   = start + this.pageSize;
    this.sagas  = list.slice(start, end);
  }
}
