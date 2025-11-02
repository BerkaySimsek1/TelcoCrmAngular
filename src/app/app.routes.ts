import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Search } from './pages/search/search';
import { CreateCustomer } from './pages/customer/create-customer/create-customer';
import { CustomerInfo } from './pages/customer/customer-info/customer-info';
import { UpdateCustomer } from './pages/customer/update-customer/update-customer';
import { AddressListComponent } from './components/address-list/address-list';
import { CustomerAddressCreateCard } from './components/customer-address-create-card/customer-address-create-card';
import { UpdateAddressCard } from './components/update-address-card/update-address-card';
import { ContactmediumInfo } from './pages/contactmedium/contactmedium-info/contactmedium-info';
import { UpdateContactmedium } from './pages/contactmedium/update-contactmedium/update-contactmedium';
import { CreateContactmedium } from './pages/contactmedium/create-contactmedium/create-contactmedium';
import { authGuard } from './guards/auth.guard';
import { CustomerNavbarComponent } from './components/customer-navbar-component/customer-navbar-component';
import { BillingAccountInfoListComponent } from './components/billing-account-info-list/billing-account-info-list';
import { CreateBillingAccountComponent } from './components/create-billing-account-card/create-billing-account-card';
import { UpdateBillingAccountComponent } from './components/update-billing-account-card/update-billing-account-card';

export const routes: Routes = [
  // Login
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: Login },

  // Search
  { path: 'search-list', component: Search, canActivate: [authGuard] },

  // Create Customer (standalone)
  { path: 'create-customer', component: CreateCustomer, canActivate: [authGuard] },
  { path: 'create-contactmedium', component: CreateContactmedium, canActivate: [authGuard] },
  { path: 'create-billing-account', component: CreateBillingAccountComponent, canActivate: [authGuard] },
  // Update pages (navbar dışında - standalone)
  { path: 'customer-update/:customerId', component: UpdateCustomer, canActivate: [authGuard] },
  { path: 'address-update/:customerId/:addressId', component: UpdateAddressCard, canActivate: [authGuard] },
  { path: 'contactmedium-update/:customerId', component: UpdateContactmedium, canActivate: [authGuard] },
  { path: 'customers/:customerId/addresses/new', component: CustomerAddressCreateCard, canActivate: [authGuard] },
  { path: 'billing-account-update', component: UpdateBillingAccountComponent, canActivate: [authGuard] },
  // Customer Detail with navbar (sadece info ve list sayfaları)
  {
    path: 'customer/:customerId',
    component: CustomerNavbarComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'info', pathMatch: 'full' },
      { path: 'info', component: CustomerInfo },
      { path: 'addresses', component: AddressListComponent, data: { mode: 'standalone' } },
      { path: 'contact', component: ContactmediumInfo },
      { path: 'customer-account',component:BillingAccountInfoListComponent}
    ]
  },
   
  // Onboarding wizard
  { 
    path: 'onboarding/addresses', 
    component: AddressListComponent, 
    data: { mode: 'wizard' }, 
    canActivate: [authGuard] 
  },
  { 
    path: 'onboarding/addresses/new', 
    component: CustomerAddressCreateCard, 
    data: { mode: 'wizard' }, 
    canActivate: [authGuard] 
  },
  { 
    path: 'onboarding/addresses/:tmpId/edit', 
    component: UpdateAddressCard, 
    data: { mode: 'wizard' }, 
    canActivate: [authGuard] 
  },
  // Fallback
  { path: '**', redirectTo: '/search-list' }
];