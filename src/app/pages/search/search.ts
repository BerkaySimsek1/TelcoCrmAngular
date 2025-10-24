import { Component } from '@angular/core';
import { SearchCustomerCard } from '../../components/search-customer-card/search-customer-card';
import { SearchCustomerList } from '../../components/search-customer-list/search-customer-list';

@Component({
  selector: 'app-search',
  imports: [SearchCustomerCard,SearchCustomerList],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {

}
