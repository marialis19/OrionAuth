import { Routes } from '@angular/router';
import { Login } from './components/login/login'; 
import { Home } from './components/home/home';
import { Register } from './components/register/register';
import { authGuard } from './auth-guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' }, 
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'home',
        component: Home, 
        canActivate: [authGuard] },

    { path: '**', redirectTo: '/login' }
];