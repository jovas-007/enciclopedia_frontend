import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticasApiScreenComponent } from './estadisticas-api-screen.component';

describe('EstadisticasApiScreenComponent', () => {
  let component: EstadisticasApiScreenComponent;
  let fixture: ComponentFixture<EstadisticasApiScreenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EstadisticasApiScreenComponent]
    });
    fixture = TestBed.createComponent(EstadisticasApiScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
