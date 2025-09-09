// src/app/screens/navbar/navbar.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, User } from '../../services/auth.service';
import { SidenavService } from '../../services/sidenav.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  /** Controla si el sidenav está abierto (se enlaza en el template) */
  public isSidenavOpen: boolean = false;

  /** Página actualmente activa (para marcar el enlace “active”) */
  public currentPage: string = 'home';

  /** Datos del usuario autenticado; null si no hay sesión */
  public currentUser: User | null = null;

  /** Suscripciones para limpiar en ngOnDestroy */
  private userSub!: Subscription;
  private sidenavSub!: Subscription;

  constructor(
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly sidenavService: SidenavService
  ) {}

  /** Se ejecuta al montar el componente */
  public ngOnInit(): void {
    // 1) Escucha cambios de usuario
    this.userSub = this.authService.currentUser$
      .subscribe((user: User | null) => this.currentUser = user);

    // 2) Sincroniza el estado abierto/cerrado del sidenav
    this.sidenavSub = this.sidenavService.open$
      .subscribe((open: boolean) => this.isSidenavOpen = open);

    // 3) Marca al iniciar la ruta activa
    const path = this.router.url.split('/')[1];
    this.currentPage = path || 'home';
  }

  /** Se ejecuta al destruir el componente */
  public ngOnDestroy(): void {
    this.userSub.unsubscribe();
    this.sidenavSub.unsubscribe();
  }

  /** Dispara el toggle del sidenav en el servicio */
  public toggleSidenav(): void {
    this.sidenavService.toggle();
  }

  /** Abre el panel de administración en una nueva pestaña */
public irAdmin(): void {
  window.open('/backend/admin/', '_blank');
}

  /**
   * Navega a la ruta indicada y marca el enlace activo
   * (no cierra el sidenav aquí, lo manejará el propio componente sidenav en mobile)
   */
  public showPage(page: string): void {
    this.currentPage = page;
    this.router.navigate([`/${page}`]);
  }

  /**
   * Si hay sesión, cierra sesión y siempre redirige a login
   */
  public toggleAuth(): void {
    if (this.currentUser) {
      this.authService.logout();
    }
    this.router.navigate(['/login']);
  }
}
