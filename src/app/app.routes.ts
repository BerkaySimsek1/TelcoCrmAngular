import { Routes } from '@angular/router';
import { CreateCustomer } from './pages/customer/create-customer/create-customer';
import { CustomerInfo } from './pages/customer/customer-info/customer-info';
import { UpdateCustomer } from './pages/customer/update-customer/update-customer';
import { CreateAddress } from './pages/address/create-address/create-address';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'create-customer' },
  { path: 'create-customer', component: CreateCustomer },
  // 🔽 paramlı route
  { path: 'customer-info/:customerId', component: CustomerInfo },
  {
    path: 'customer-update/:customerId',
    component: UpdateCustomer, // içinde <app-update-customer-card> var
  },
   {
    path: 'create-address/:customerId',
    component: CreateAddress, 
  },
];
