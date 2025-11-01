import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-customer-detail-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: `./customer-navbar-component.html`,
  styleUrls: [`./customer-navbar-component.scss`]
})
export class CustomerNavbarComponent implements OnInit {
  customerId!: string;
  activeTab: 'info' | 'address' | 'contact' = 'info';

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.customerId = params['customerId'];
    });

    this.updateActiveTab();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateActiveTab();
    });
  }

  updateActiveTab() {
    const currentUrl = this.router.url;
    
    if (currentUrl.includes('/info')) {
      this.activeTab = 'info';
    } else if (currentUrl.includes('/addresses')) {
      this.activeTab = 'address';
    } else if (currentUrl.includes('/contact')) {
      this.activeTab = 'contact';
    }
  }

  getTabClasses(tab: 'info' | 'address' | 'contact'): string {
    const isActive = this.activeTab === tab;
    const baseClasses = 'flex-1 px-6 py-3 text-center font-medium text-sm rounded-xl';
    
    if (isActive) {
      return `${baseClasses} bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md shadow-orange-200 transform scale-[1.02]`;
    }
    
    return `${baseClasses} text-gray-600 hover:bg-gray-50 hover:text-gray-800`;
  }

  navigateToTab(tab: 'info' | 'address' | 'contact') {
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
    }
  }

  navigateToEdit() {
    // Eski route yapısını kullan
    this.router.navigate(['/customer-update', this.customerId]);
  }

  navigateToSearch() {
    this.router.navigate(['/search-list']);
  }
}