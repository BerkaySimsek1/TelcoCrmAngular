import { Component } from '@angular/core';
import { AddressListComponent } from '../../../components/AddressComponents/address-list/address-list';

@Component({
  selector: 'app-address-info-list',
  imports: [AddressListComponent],
  templateUrl: './address-info-list.html',
  styleUrl: './address-info-list.scss',
})
export class AddressList {

}
