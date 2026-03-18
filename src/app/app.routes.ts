import { Routes } from '@angular/router';
import { HomeComponent } from './Components/home/home.component';
import { LoginComponent } from './Components/login/login.component';
import { RegistroComponent } from './Components/registro/registro.component';
import { CarritoComponent } from './Components/carrito/carrito.component';
import { CompraFinalComponent } from './Components/compra-final/compra-final.component';
import { TerminosUsoComponent } from './Components/terminos-uso/terminos-uso.component';
import { CategoriaComponent } from './Components/categoria/categoria.component';

export const routes: Routes = [
  { path: '',          component: HomeComponent,       pathMatch: 'full' },
  { path: 'login',     component: LoginComponent },
  { path: 'registro',  component: RegistroComponent },
  { path: 'carrito',   component: CarritoComponent },
  { path: 'gracias',   component: CompraFinalComponent },
  { path: 'terminos',  component: TerminosUsoComponent },
  // Categorías del nav — fácil de ampliar cuando haya BD
  { path: ':categoria', component: CategoriaComponent },
  { path: '**',         redirectTo: '' }
];
