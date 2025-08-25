import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidenavService {

  constructor() { }

  /** Subject que almacena si el sidenav está abierto o cerrado */
  private openSubject = new BehaviorSubject<boolean>(false);
  /** Observable que emite cada vez que cambie el estado */
  public open$ = this.openSubject.asObservable();

  /** Alterna el estado */
  public toggle(): void {
    this.openSubject.next(!this.openSubject.value);
  }

  /** Fuerza abierto */
  public open(): void {
    this.openSubject.next(true);
  }

  /** Fuerza cerrado */
  public close(): void {
    this.openSubject.next(false);
  }
}
