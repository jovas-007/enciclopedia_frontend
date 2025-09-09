import { AfterViewInit, Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { PersonajesService, Personaje } from '../../services/personajes.service';

@Component({
  selector: 'app-personajes-api-screen',
  templateUrl: './personajes-api-screen.component.html',
  styleUrls: ['./personajes-api-screen.component.scss']
})
export class PersonajesApiScreenComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('ordenAnchor', { static: true }) ordenAnchor!: ElementRef<HTMLElement>;

  /** Ancho en px que usará el panel del mat-select */
  panelWidth: string = '260px'; // valor inicial de cortesía

  ngAfterViewInit(): void {
    this.syncPanelWidth();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.syncPanelWidth();
  }

  private syncPanelWidth(): void {
    if (!this.ordenAnchor) { return; }
    const w = this.ordenAnchor.nativeElement.offsetWidth;
    // Protegemos un mínimo para que no colapse
    this.panelWidth = `${Math.max(w, 200)}px`;
  }

  // ========================Variables ========================
  // Carga
  public isLoading: boolean = true;

  // Datos base (todos) y rebanada paginada
  public personajes: Personaje[] = [];
  public personajesPagina: Personaje[] = [];

  // Paginación
  public paginaActual: number = 0;   // índice 0-based
  public tamPagina: number = 12;     // items por página
  public totalFiltrados: number = 0; // total después de ordenar/filtrar (aquí no filtramos, sólo orden)

  // Ordenamiento (coincide con el <select> del HTML)
  public ordenActual: 'nombre_asc' | 'nombre_desc' | 'ki_asc' | 'ki_desc' = 'nombre_asc';

  // Descripciones expandidas por id (para “mostrar más…”)
  public descripcionesExpandidas: Record<number, boolean> = {};

  // Subscripciones
  private subDatos?: Subscription;

  constructor(
    private readonly PersonajesService: PersonajesService
  ) {}

  // ========================
  // Ciclo de vida
  // ========================
  public ngOnInit(): void {
    this.subDatos = this.PersonajesService.obtenerPersonajes().subscribe({
      next: (items: Personaje[]) => {
        this.personajes = items ?? [];
        // Inicializamos totales y primera “página”
        this.totalFiltrados = this.personajes.length;
        this.aplicarOrden();   // ordena según ordenActual
        this.recalcularPagina();
        this.isLoading = false;
      },
      error: () => {
        this.personajes = [];
        this.totalFiltrados = 0;
        this.recalcularPagina();
        this.isLoading = false;
      }
    });
  }

  public ngOnDestroy(): void {
    this.subDatos?.unsubscribe();
  }

  // ========================
  // Ordenamiento
  // ========================
  public onOrdenChange(valor: string): void {
    // Aseguramos tipo
    const val = valor as typeof this.ordenActual;
    this.ordenActual = val;
    this.aplicarOrden();
    // Al cambiar orden, volvemos a primera página
    this.paginaActual = 0;
    this.recalcularPagina();
  }

  private aplicarOrden(): void {
    const lista = [...this.personajes];

    const parseKi = (ki: string): number => {
      // Extrae un número “base” de la cadena (ej. "60.000.000" -> 60000000)
      // Nota: es un parse simple para ordenar de forma aproximada
      const limpio = (ki || '').toString().replace(/[^\d.]/g, '');
      const n = Number(limpio);
      return isNaN(n) ? -Infinity : n;
    };

    switch (this.ordenActual) {
      case 'nombre_asc':
        lista.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'nombre_desc':
        lista.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case 'ki_asc':
        lista.sort((a, b) => parseKi(a.ki) - parseKi(b.ki));
        break;
      case 'ki_desc':
        lista.sort((a, b) => parseKi(b.ki) - parseKi(a.ki));
        break;
    }

    this.personajes = lista;
    this.totalFiltrados = this.personajes.length;
  }

  // ========================
  // Paginación (cliente)
  // ========================
  public onPageChange(e: PageEvent): void {
    this.paginaActual = e.pageIndex;
    this.tamPagina    = e.pageSize;
    this.recalcularPagina();
  }

  private recalcularPagina(): void {
    const inicio = this.paginaActual * this.tamPagina;
    const fin    = inicio + this.tamPagina;
    this.personajesPagina = this.personajes.slice(inicio, fin);
  }

  // ========================
  // Colapsar/Expandir descripción
  // ========================
  public toggleDescripcion(id: number): void {
    this.descripcionesExpandidas[id] = !this.descripcionesExpandidas[id];
  }

  public isExpanded(id: number): boolean {
    return !!this.descripcionesExpandidas[id];
  }

  // ========================
  // Utilidades de template
  // ========================
  public trackById(_index: number, item: Personaje): number {
    return item.id;
  }

  public onImgError(ev: Event): void {
    (ev.target as HTMLImageElement).src = 'assets/placeholder-dbz.png';
  }
}
