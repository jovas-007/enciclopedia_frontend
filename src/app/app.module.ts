// app.module.ts
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeScreenComponent } from './screens/home-screen/home-screen.component';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { NavbarComponent } from './partials/navbar/navbar.component';
import { SidenavComponent } from './partials/sidenav/sidenav.component';
import { FooterComponent } from './partials/footer/footer.component';
import { PageHeaderComponent } from './partials/page-header/page-header.component';
import { LoadingSpinnerComponent } from './partials/loading-spinner/loading-spinner.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PersonajesScreenComponent } from './screens/personajes-screen/personajes-screen.component';

// Angular Material (importa cada módulo una sola vez)
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatSelectModule }    from '@angular/material/select';
import { MatIconModule }      from '@angular/material/icon';
import { MatButtonModule }    from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule }    from '@angular/material/dialog';
import { MatMenuModule }      from '@angular/material/menu';

// Paginador en español
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getSpanishPaginatorIntl } from './shared/spanish-paginator-intl';

import { TransformacionesScreenComponent } from './screens/transformaciones-screen/transformaciones-screen.component';
import { SagasScreenComponent } from './screens/sagas-screen/sagas-screen.component';
import { PersonajesApiScreenComponent } from './screens/personajes-api-screen/personajes-api-screen.component';

// Formularios de personajes y servicios
import { PersonajeFormComponent } from './components/personaje-form.component';
import { PersonajeFormDialogComponent } from './components/personaje-form-dialog.component';
import { ConfirmDialogComponent } from './components/confirm-dialog.component';
import { PersonajesLocalService } from './services/personajes-local.service';
import { PersonajesService } from './services/personajes.service';

// Nueva pantalla de estadísticas
import { EstadisticasScreenComponent } from './screens/estadisticas-screen/estadisticas-screen.component';

// Importar NgChartsModule (sin provideCharts)
import { NgChartsModule } from 'ng2-charts';

// *** Registrar Chart.js al inicio ***
import { Chart } from 'chart.js';
import { registerables } from 'chart.js';
import { EstadisticasApiScreenComponent } from './screens/estadisticas-api-screen/estadisticas-api-screen.component';
Chart.register(...registerables);

@NgModule({
  declarations: [
    AppComponent,
    HomeScreenComponent,
    LoginScreenComponent,
    NavbarComponent,
    SidenavComponent,
    FooterComponent,
    PageHeaderComponent,
    LoadingSpinnerComponent,
    PersonajesScreenComponent,
    TransformacionesScreenComponent,
    SagasScreenComponent,
    PersonajeFormComponent,
    PersonajeFormDialogComponent,
    ConfirmDialogComponent,
    PersonajesApiScreenComponent,
    EstadisticasScreenComponent,
    EstadisticasApiScreenComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    // Módulos de Angular Material (una sola vez cada uno)
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatDialogModule,
    MatMenuModule,
    NgChartsModule,
  ],
  providers: [
    PersonajesLocalService,
    PersonajesService,
    { provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
// src/app/app.module.ts