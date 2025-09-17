import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeScreenComponent } from './screens/home-screen/home-screen.component';
import { LoginScreenComponent } from './screens/login-screen/login-screen.component';
import { PersonajesScreenComponent } from './screens/personajes-screen/personajes-screen.component';
import { TransformacionesScreenComponent } from './screens/transformaciones-screen/transformaciones-screen.component';
import { SagasScreenComponent } from './screens/sagas-screen/sagas-screen.component';
import { PersonajesApiScreenComponent } from './screens/personajes-api-screen/personajes-api-screen.component';
//vista de estadisticas
import { EstadisticasScreenComponent } from './screens/estadisticas-screen/estadisticas-screen.component';
import { EstadisticasApiScreenComponent } from './screens/estadisticas-api-screen/estadisticas-api-screen.component';

const routes: Routes = [
  { path: "", redirectTo: "home", pathMatch: 'full'},
  { path: "home", component: HomeScreenComponent, pathMatch: 'full'},
  { path: "login", component: LoginScreenComponent, pathMatch: 'full'},
  { path: "personajes", component: PersonajesScreenComponent, pathMatch: 'full'},
  { path: "transformaciones", component: TransformacionesScreenComponent, pathMatch: 'full'},
  { path: "sagas", component: SagasScreenComponent, pathMatch: 'full'},
  { path: "personajes-api", component: PersonajesApiScreenComponent, pathMatch: 'full'},
  { path: 'estadisticas', component: EstadisticasScreenComponent, pathMatch: 'full' },
  { path: "estadisticas-api", component: EstadisticasApiScreenComponent, pathMatch: 'full' }  // nueva ruta
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
