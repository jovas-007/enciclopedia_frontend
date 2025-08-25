import { Component, OnInit } from '@angular/core';
import { StatsService, DashboardStats } from 'src/app/services/stats.service';

@Component({
  selector: 'app-home-screen',
  templateUrl: './home-screen.component.html',
  styleUrls: ['./home-screen.component.scss']
})
export class HomeScreenComponent implements OnInit {
  /** Controla la visibilidad del spinner de carga */
  public isLoading: boolean = true;

  /** Estadísticas a mostrar en el dashboard */
  public charactersCount: number = 0;
  public transformationsCount: number = 0;
  public sagasCount: number = 0;
  public episodesCount: number = 0;

  /**
   * Inyecta el servicio de estadísticas.
   * readonly porque no se reasignará después de la construcción.
  */
  constructor(
     private readonly statsService: StatsService
  ) {}

  ngOnInit(): void {
     this.loadDashboardStats();
  }

  /**
   * Llama al servicio para obtener las estadísticas y
   * actualiza las propiedades públicas.
   */

  private loadDashboardStats(): void {
    this.statsService.getDashboardStats().subscribe({
      next: (stats: DashboardStats): void => {
        this.charactersCount      = stats.characters;
        this.transformationsCount = stats.transformations;
        this.sagasCount           = stats.sagas;
        this.episodesCount        = stats.episodes;
        this.isLoading = false;
      },
      error: (error: unknown): void => {
        console.error('Error al cargar estadísticas del dashboard', error);
        this.isLoading = false;
      }
    });
  }

}
