import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.component.html',
  styleUrls: ['./page-header.component.scss']
})
export class PageHeaderComponent implements OnInit {
  /** Título principal de la pantalla */
  @Input() title: string = '';

  /** Subtítulo o descripción secundaria */
  @Input() subtitle: string = '';

  constructor() { }

  ngOnInit(): void {
    // Initialization logic can go here
  }

}
