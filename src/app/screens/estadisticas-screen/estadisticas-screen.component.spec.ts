import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadisticasScreenComponent } from './estadisticas-screen.component';

describe('EstadisticasScreenComponent', () => {
  let component: EstadisticasScreenComponent;
  let fixture: ComponentFixture<EstadisticasScreenComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EstadisticasScreenComponent]
    });
    fixture = TestBed.createComponent(EstadisticasScreenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

