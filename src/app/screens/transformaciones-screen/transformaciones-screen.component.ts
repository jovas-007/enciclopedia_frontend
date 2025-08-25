import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject, Subscription, combineLatest, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, startWith, switchMap, tap, catchError, map } from 'rxjs/operators';
import { MatPaginatorIntl, PageEvent as MatPaginatorPageEvent } from '@angular/material/paginator';

import { TransformacionesService, ApiResponse, Personaje } from '../../services/transformaciones.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-transformaciones-screen',
  templateUrl: './transformaciones-screen.component.html',
  styleUrls: ['./transformaciones-screen.component.scss']
})
export class TransformacionesScreenComponent implements OnInit, OnDestroy {

  public isLoading = true;

  public personajesConTransfs: Personaje[] = [];

  public totalItems = 0;
  public pageIndex = 0;               // 0-based para el paginator
  public pageSize  = 12;
  public pageSizeOptions = [12, 24, 36];

  public query = '';
  public filtroRaza = '';

  // Si ya tienes role en tu User, esto está bien.
  public isAdmin$ = this.auth.currentUser$.pipe(
    map(u => !!u && (u as any).role === 'admin')
  );

  // Control reactivo
  private search$    = new Subject<string>();
  private raza$      = new BehaviorSubject<string>('');
  private pageIndex$ = new BehaviorSubject<number>(0);
  private pageSize$  = new BehaviorSubject<number>(this.pageSize);

  private sub = new Subscription();

  // Flag para alternar demo/backend sin tocar más código
  private useBackend = false;

  constructor(
    private readonly svc: TransformacionesService,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly paginatorIntl: MatPaginatorIntl
  ) {}

  ngOnInit(): void {

    const searchDebounced$ = this.search$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      startWith(this.query)
    );

    const dataSub = combineLatest([
      searchDebounced$,
      this.raza$,
      this.pageIndex$,
      this.pageSize$
    ])
    .pipe(
      tap(() => (this.isLoading = true)),
      switchMap(([search, race, pageIndex, pageSize]) => {
        // ——— DEMO (API pública) ———
        const demo$ = this.svc.getPersonajesConTransformaciones({
          page: pageIndex + 1,                 // 1-based
          limit: pageSize,
          search: trimOrUndefined(search),
          race: trimOrUndefined(race)
        });

        // ——— REAL (Django) ———
        const real$ = this.svc.getPersonajesConTransformacionesBackend({
          page: pageIndex + 1,
          limit: pageSize,
          search: trimOrUndefined(search),
          race: trimOrUndefined(race),
          orderBy: 'name',
          orderDir: 'asc'
        });

        const source$ = this.useBackend ? real$ : demo$;

        return source$.pipe(
          catchError(() => of<ApiResponse<Personaje>>({
            items: [],
            meta: {
              totalItems: 0, itemCount: 0,
              itemsPerPage: pageSize, totalPages: 0,
              currentPage: pageIndex + 1
            }
          }))
        );
      })
    )
    .subscribe(resp => {
      this.personajesConTransfs = resp.items ?? [];
      this.totalItems           = resp.meta?.totalItems ?? 0;

      // Corrige desbordes si cambia pageSize/filtros
      if (this.totalItems > 0 && this.pageIndex * this.pageSize >= this.totalItems) {
        this.onPageChange({ pageIndex: 0, pageSize: this.pageSize, length: this.totalItems });
        return;
      }
      this.isLoading = false;
    });

    this.sub.add(dataSub);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  /* ===== Handlers ===== */

  public onSearch(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const value = input?.value ?? '';
    this.query = value;
    this.pageIndex = 0;
    this.pageIndex$.next(0);
    this.search$.next(value);
  }

  public onFiltroChange(race: string): void {
    this.filtroRaza = race;
    this.pageIndex = 0;
    this.pageIndex$.next(0);
    this.raza$.next(race);
  }

  public onPageChange(ev: MatPaginatorPageEvent): void {
    this.pageIndex = ev.pageIndex;
    this.pageSize  = ev.pageSize;
    this.pageIndex$.next(ev.pageIndex);
    this.pageSize$.next(ev.pageSize);
  }

  public irADetallePersonaje(id: number): void {
    this.router.navigate(['/personajes', id]);
  }

  public irARegistrarTransformacion(p?: Personaje): void {
    if (p) {
      this.router.navigate(['/admin', 'personajes', p.id, 'transformaciones', 'nueva']);
    } else {
      this.router.navigate(['/admin', 'transformaciones', 'nueva']);
    }
  }

  public onImgError(event: Event): void {
    const img = event.target as HTMLImageElement | null;
    if (img) {
      img.src = 'assets/img/placeholder-character.webp';
      img.onerror = null;
    }
  }
}

/* helper */
function trimOrUndefined(v?: string): string | undefined {
  const t = (v ?? '').trim();
  return t ? t : undefined;
}
