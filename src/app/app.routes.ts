import { Routes } from '@angular/router';
import { AppComponent } from './app.component';

export const routes: Routes = [
  { path: '', component: AppComponent }, // Home como ruta principal
  { path: '**', redirectTo: '', pathMatch: 'full' }
];