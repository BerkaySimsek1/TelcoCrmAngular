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
import { UpdateContactmedium } from './pages/contactmedium/update-contactmedium/update-contactmedium';
import { ContactmediumInfo } from './pages/contactmedium/contactmedium-info/contactmedium-info';
import { CreateContactmedium } from './pages/contactmedium/create-contactmedium/create-contactmedium';
import { CustomerAddressCreateCard } from './components/customer-address-create-card/customer-address-create-card';
import { AddressListComponent } from './components/address-list/address-list';

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
  { path: 'create-contactmedium', component: CreateContactmedium,canActivate: [authGuard] },
  {path: 'contactmedium-update/:customerId', component: UpdateContactmedium,canActivate: [authGuard]},
  {path: 'contactmedium-info/:customerId',component: ContactmediumInfo,canActivate: [authGuard]},
  {path: 'customer-address-create', component: CustomerAddressCreateCard, canActivate: [authGuard] }, // Diğer tüm bilinmeyen yolları arama sayfasına yönlendir
  
{ path: 'onboarding/addresses', component: AddressList, data: { mode: 'wizard' }, canActivate: [authGuard] },
{ path: 'onboarding/addresses/new', component: CustomerAddressCreateCard, data: { mode: 'wizard' }, canActivate: [authGuard] },

{ path: 'customers/:customerId/addresses', component: AddressList, data: { mode: 'standalone' }, canActivate: [authGuard] },
{ path: 'customers/:customerId/addresses/new', component: CustomerAddressCreateCard, data: { mode: 'standalone' }, canActivate: [authGuard] },

];
