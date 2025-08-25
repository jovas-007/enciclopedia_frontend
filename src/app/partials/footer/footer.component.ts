import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  /** Año actual para el pie de página */
  currentYear: number = new Date().getFullYear();

  constructor(
    private router: Router
  ) { }

  ngOnInit(): void {
    // Initialization logic can go here
  }

  /**
   * Navega a la ruta indicada y cierra cualquier menú abierto
   */
  showPage(page: string): void {
    this.router.navigate([`/${page}`]);
  }

}
