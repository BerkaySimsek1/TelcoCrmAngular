import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

type Tab = 'info' | 'address' | 'contact' | 'account';

@Component({
  selector: 'app-customer-detail-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: `./customer-navbar-component.html`,
  styleUrls: [`./customer-navbar-component.scss`]
})
export class CustomerNavbarComponent implements OnInit {
  customerId!: string;
  activeTab: Tab = 'info';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.customerId = params['customerId'];
    });

    this.updateActiveTab();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateActiveTab());
  }

  private updateActiveTab() {
    const currentUrl = this.router.url;

    if (currentUrl.includes('/info')) {
      this.activeTab = 'info';
    } else if (currentUrl.includes('/addresses')) {
      this.activeTab = 'address';
    } else if (currentUrl.includes('/contact')) {
      this.activeTab = 'contact';
    } else if (currentUrl.includes('/customer-account')) {
      this.activeTab = 'account';
    }
  }

  getTabClasses(tab: Tab): string {
    const isActive = this.activeTab === tab;
    const base = 'flex-1 px-6 py-3 text-center font-medium text-sm rounded-xl';
    return isActive
      ? `${base} bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md shadow-orange-200 transform scale-[1.02]`
      : `${base} text-gray-600 hover:bg-gray-50 hover:text-gray-800`;
  }

  navigateToTab(tab: Tab) {
    switch (tab) {
      case 'info':
        this.router.navigate(['/customer', this.customerId, 'info']);
        break;
      case 'address':
        this.router.navigate(['/customer', this.customerId, 'addresses']);
        break;
      case 'contact':
        this.router.navigate(['/customer', this.customerId, 'contact']);
        break;
      case 'account':
        this.router.navigate(['/customer', this.customerId, 'customer-account']);
        break;
    }
  }

  navigateToEdit() {
    this.router.navigate(['/customer-update', this.customerId]);
  }

  navigateToSearch() {
    this.router.navigate(['/search-list']);
  }
}
