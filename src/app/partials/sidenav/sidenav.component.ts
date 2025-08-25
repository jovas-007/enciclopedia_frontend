// src/app/screens/sidenav/sidenav.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SidenavService } from '../../services/sidenav.service';

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss']
})
export class SidenavComponent implements OnInit, OnDestroy {
  /** Estado del menú lateral: abierto (true) o cerrado (false) */
  public isSidenavOpen: boolean = false;

  /** Nombre de la ruta activa para aplicar la clase “active” */
  public currentPage: string = 'home';

  /** Suscripción al observable del servicio para gestionar el sidenav */
  private sidenavSub!: Subscription;

  /**
   * @param router          Para navegar entre rutas
   * @param sidenavService  Servicio compartido que emite el estado del sidenav
   */
  constructor(
    private readonly router: Router,
    private readonly sidenavService: SidenavService
  ) {}

  /** Se ejecuta al inicializar el componente */
  public ngOnInit(): void {
    // 1) Nos suscribimos al estado del SidenavService
    this.sidenavSub = this.sidenavService.open$
      .subscribe((open: boolean) => {
        this.isSidenavOpen = open;
      });

    // 2) Inicializamos currentPage desde la URL actual
    const path = this.router.url.split('/')[1];
    this.currentPage = path ? path : 'home';
  }

  /** Se ejecuta al destruir el componente */
  public ngOnDestroy(): void {
    // Liberamos la suscripción para evitar memory leaks
    this.sidenavSub.unsubscribe();
  }

  /** Invocado desde el navbar: alterna abierto/cerrado en el servicio */
  public toggleSidenav(): void {
    this.sidenavService.toggle();
  }

  /**
   * Navega a la ruta indicada, marca ese item como activo
   * y cierra el sidenav (muy útil en móvil)
   * @param page  Nombre de la ruta (e.g. 'home', 'characters')
   */
  public showPage(page: string): void {
    this.currentPage = page;
    this.router.navigate([`/${page}`]);
    this.sidenavService.close();
  }
}
