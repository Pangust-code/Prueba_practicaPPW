import { Routes } from '@angular/router';
import { LoginPage } from './Features/login-page/login-page';
import { HomePage } from './Features/pokemon/pages/home-page/home-page';
import { PokemonDetailPage } from './Features/pokemon/pages/pokemon-detail-page/pokemon-detail-page';

export const routes: Routes = [

  {
    path: '',
    component: LoginPage,
  },

  { path: 'home',
    component: HomePage,
  },

  { path: 'pokemon/:id',
    component: PokemonDetailPage,
  },

  { path: '**',
    redirectTo: '',
  },
];
