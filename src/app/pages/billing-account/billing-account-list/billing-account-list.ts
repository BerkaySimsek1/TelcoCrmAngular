import { Component } from '@angular/core';
import { BillingAccountInfoListComponent } from '../../../components/BillingAccountComponents/billing-account-info-list/billing-account-info-list';


@Component({
  selector: 'app-billing-account-list',
  imports: [BillingAccountInfoListComponent],
  templateUrl: './billing-account-list.html',
  styleUrl: './billing-account-list.scss',
})
export class BillingAccountList {

}
