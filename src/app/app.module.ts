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

//Angular material
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule }     from '@angular/material/input';
import { MatSelectModule }    from '@angular/material/select';
import { MatIconModule }      from '@angular/material/icon';
import { MatButtonModule }    from '@angular/material/button';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatExpansionModule} from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';

//Para el paginator
import { MatPaginatorIntl } from '@angular/material/paginator';
import { getSpanishPaginatorIntl } from './shared/spanish-paginator-intl';
import { TransformacionesScreenComponent } from './screens/transformaciones-screen/transformaciones-screen.component';
import { SagasScreenComponent } from './screens/sagas-screen/sagas-screen.component';

// Componentes para los formularios de personajes
import { PersonajeFormComponent } from './components/personaje-form.component';
import { PersonajesLocalService } from './services/personajes-local.service';

import { PersonajeFormDialogComponent } from './components/personaje-form-dialog.component';

// Servicios
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
    PersonajeFormDialogComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    MatExpansionModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  providers: [
    PersonajesLocalService,
    { provide: MatPaginatorIntl, useValue: getSpanishPaginatorIntl() }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
