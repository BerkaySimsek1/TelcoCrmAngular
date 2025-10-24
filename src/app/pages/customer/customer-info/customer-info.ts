import { Component } from '@angular/core';
import { CustomerInfoCard } from "../../../components/customer-info-card/customer-info-card";

@Component({
  selector: 'app-customer-info',
  imports: [CustomerInfoCard],
  templateUrl: './customer-info.html',
  styleUrl: './customer-info.scss',
})
export class CustomerInfo {

}
