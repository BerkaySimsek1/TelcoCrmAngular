import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-customer-card',
  templateUrl: './search-customer-card.html',
  styleUrls: ['./search-customer-card.scss'],
  imports:[CommonModule,ReactiveFormsModule]
})
export class SearchCustomerCard {

  @Output() search = new EventEmitter<string>();
  searchForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      keyword: ['']
    });
  }

  onSubmit() {
    const keyword = this.searchForm.get('keyword')?.value?.trim();
    if (keyword) {
      this.search.emit(keyword);
    }
  }
}

