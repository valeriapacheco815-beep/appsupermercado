import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'carnes',
    loadComponent: () => import('./carnes/carnes.page').then( m => m.CarnesPage)
  },
  {
    path: 'lacteos',
    loadComponent: () => import('./lacteos/lacteos.page').then( m => m.LacteosPage)
  },
  {
    path: 'importados',
    loadComponent: () => import('./importados/importados.page').then( m => m.ImportadosPage)
  },
];
