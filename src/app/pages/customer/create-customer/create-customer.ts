import { Component } from '@angular/core';
import { CreateCustomerCard } from "../../../components/CustomerComponents/create-customer-card/create-customer-card";

@Component({
  selector: 'app-create-customer',
  imports: [CreateCustomerCard],
  templateUrl: './create-customer.html',
  styleUrl: './create-customer.scss',
})
export class CreateCustomer {

}
