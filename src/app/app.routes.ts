import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Trains } from './pages/trains/trains';
import { Booking } from './pages/booking/booking';
import { Confirmation } from './pages/confirmation/confirmation';
import { CheckTicket } from './pages/check-ticket/check-ticket';
import { Payment } from './pages/payment/payment';
import { authGuard } from './guards/auth-guard';
import { Login } from './pages/login/login';
import { Register } from './pages/register/register';
import { Profile } from './pages/profile/profile';


export const routes: Routes = [
  { path: '', component: Home },
  { path: 'trains', component: Trains, canActivate: [authGuard] },
  { path: 'booking', component: Booking, canActivate: [authGuard] },
  { path: 'confirmation', component: Confirmation, canActivate: [authGuard] },
  { path: 'check-ticket', component: CheckTicket, canActivate: [authGuard] },
  { path: 'payment', component: Payment, canActivate: [authGuard] },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'profile', component: Profile, canActivate: [authGuard] },
];