import { Routes } from '@angular/router';
import { CreateCustomer } from './pages/customer/create-customer/create-customer';
import { CustomerInfo } from './pages/customer/customer-info/customer-info';
import { UpdateCustomer } from './pages/customer/update-customer/update-customer';
import { CreateAddress } from './pages/address/create-address/create-address';
import { AddressList } from './pages/address/address-info-list/address-info-list';
import { Search } from './pages/search/search';
import { UpdateAddress } from './pages/address/update-address/update-address';
import { Login } from './pages/login/login';
import { authGuard } from './guards/auth.guard';


export const routes: Routes = [

  // Başlangıçta login'e gitsin veya korumalı bir sayfaya yönlensin (guard halleder)
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login }, // Login sayfası - Guard YOK

  // --- Korumalı Sayfalar ---
  { path: 'search-list', component: Search, canActivate: [authGuard] }, // Guard eklendi
  { path: 'create-customer', component: CreateCustomer, canActivate: [authGuard] }, // Guard eklendi
  { path: 'customer-info/:customerId', component: CustomerInfo, canActivate: [authGuard] }, // Guard eklendi
  { path: 'customer-update/:customerId', component: UpdateCustomer, canActivate: [authGuard] }, // Guard eklendi
  { path: 'create-address/:customerId', component: CreateAddress, canActivate: [authGuard] }, // Guard eklendi
  { path: 'address-list/:customerId', component: AddressList, canActivate: [authGuard] }, // Guard eklendi
  { path: 'address-update/:customerId/:addressId', component: UpdateAddress, canActivate: [authGuard] }, // Guard eklendi
];
