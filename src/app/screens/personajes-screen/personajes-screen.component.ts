import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PageEvent } from '@angular/material/paginator';
import { MatDialog } from '@angular/material/dialog';

import { PersonajesLocalService, Personaje } from '../../services/personajes-local.service';
import { PersonajeFormDialogComponent } from '../../components/personaje-form-dialog.component';
import { ConfirmDialogComponent, ConfirmDialogData } from '../../components/confirm-dialog.component';

@Component({
  selector: 'app-personajes-screen',
  templateUrl: './personajes-screen.component.html',
  styleUrls: ['./personajes-screen.component.scss']
})
export class PersonajesScreenComponent implements OnInit, OnDestroy {
  isLoading = true;

  personajes: Personaje[] = [];
  personajesPagina: Personaje[] = [];

  // paginación
  tamPagina = 12;
  paginaActual = 0;
  totalFiltrados = 0;

  // ordenamiento
  ordenActual: 'nombre_asc' | 'nombre_desc' | 'ki_asc' | 'ki_desc' = 'nombre_asc';
  panelWidth = '220px';

  // descripción expandida
  private expandSet = new Set<number>();

  private sub?: Subscription;

  constructor(
    private svc: PersonajesLocalService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.cargarPersonajes();
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private mapOrdenToApi(v: string): string {
    switch (v) {
      case 'nombre_asc':  return 'nombre';
      case 'nombre_desc': return '-nombre';
      case 'ki_asc':      return 'base_ki';
      case 'ki_desc':     return '-base_ki';
      default:            return 'nombre';
    }
  }

  cargarPersonajes(): void {
    this.isLoading = true;
    this.sub = this.svc.list({ ordering: this.mapOrdenToApi(this.ordenActual) }).subscribe({
      next: (res) => {
        this.personajes = res.results;
        this.totalFiltrados = this.personajes.length;
        this.paginaActual = 0;
        this.calcularPagina();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('API personajes ERROR:', err);
        this.personajes = [];
        this.personajesPagina = [];
        this.totalFiltrados = 0;
        this.isLoading = false;
      }
    });
  }

  calcularPagina(): void {
    const ini = this.paginaActual * this.tamPagina;
    const fin = ini + this.tamPagina;
    this.personajesPagina = this.personajes.slice(ini, fin);
  }

  onPageChange(ev: PageEvent): void {
    this.tamPagina = ev.pageSize;
    this.paginaActual = ev.pageIndex;
    this.calcularPagina();
  }

  onOrdenChange(value: 'nombre_asc' | 'nombre_desc' | 'ki_asc' | 'ki_desc') {
    this.ordenActual = value;
    this.cargarPersonajes();
  }

  // ======= DIÁLOGOS =======
  agregar(): void {
    const ref = this.dialog.open(PersonajeFormDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      disableClose: true,
      data: { personaje: null }
    });

    // afterClosed puede devolver Personaje | null | undefined
    ref.afterClosed().subscribe((res: Personaje | null | undefined) => {
      if (res) this.cargarPersonajes();
    });
  }

  editar(p: Personaje): void {
    const ref = this.dialog.open(PersonajeFormDialogComponent, {
      width: '720px',
      maxWidth: '95vw',
      disableClose: true,
      data: { personaje: p }
    });

    ref.afterClosed().subscribe((res: Personaje | null | undefined) => {
      if (res) this.cargarPersonajes();
    });
  }

 eliminar(id: number, nombre?: string): void {
  const ref = this.dialog.open<ConfirmDialogComponent, ConfirmDialogData, boolean>(
    ConfirmDialogComponent,
    {
      width: '420px',
      maxWidth: '95vw',
      data: {
        title: 'Eliminar personaje',
        message: `Se eliminará “${nombre ?? 'este personaje'}”. Esta acción no se puede deshacer.`,
        confirmText: 'Eliminar',
        cancelText: 'Cancelar',
        warn: true
      }
    }
  );

  ref.afterClosed().subscribe((ok: boolean | undefined) => {
    if (!ok) return;
    this.svc.delete(id).subscribe({
      next: () => this.cargarPersonajes(),
      error: (e) => {
        console.error(e);
        alert('Error al eliminar');
      }
    });
  });
}


  // ======= utilidades UI =======
  imagenDe(p: Personaje): string | null {
    return p.imagen_src || p.imagen_url || null;
  }

  trackById(index: number, item: Personaje): number {
    return item.id ?? index;
  }

  onImgError(ev: Event) {
    const img = ev.target as HTMLImageElement;
    img.src = 'assets/placeholder-dbz.png';
    img.onerror = null;
  }

  isExpanded(id: number): boolean {
    return this.expandSet.has(id);
  }

  toggleDescripcion(id: number): void {
    if (this.expandSet.has(id)) this.expandSet.delete(id);
    else this.expandSet.add(id);
  }
}
