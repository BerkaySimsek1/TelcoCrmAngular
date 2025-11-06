import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ContactMediumResponse } from '../../../models/ContactMediumModels/contactMediumResponse';
import { ContactMediumService } from '../../../services/contactmedium-service';

@Component({
  selector: 'app-contactmedium-info-card',
  standalone: true,
  imports: [CommonModule,RouterLink],
  templateUrl: './contactmedium-info-card.html',
  styleUrl: './contactmedium-info-card.scss',
})
export class ContactmediumInfoCard implements OnInit {
  contactMediums = signal<ContactMediumResponse[]>([]);
  customerId = signal<string>('');
  loading = signal<boolean>(true);

  constructor(
    private route: ActivatedRoute,
    private contactMediumService: ContactMediumService
  ) {}

  ngOnInit(): void {
    this.getContactMediumInfo();
  }

  getContactMediumInfo() {
  // ✅ Parent route'tan customerId al
  const customerIdFromRoute = this.route.parent?.snapshot.paramMap.get('customerId')
                            || this.route.snapshot.paramMap.get('customerId');
  if (!customerIdFromRoute) {
    console.error('customerId paramı bulunamadı.');
    this.loading.set(false);
    return;
  }

  this.customerId.set(customerIdFromRoute);

  this.contactMediumService.getContactMediumsById(customerIdFromRoute).subscribe({
    next: (response) => {
      this.contactMediums.set(Array.isArray(response) ? response : [response]);
      this.loading.set(false);
    },
    error: (error) => {
      console.error('Error fetching contact mediums:', error);
      this.loading.set(false);
    }
  });
}

  // Helper metodlar - Contact medium type'ları formatlamak için
  getEmail(): string {
    const email = this.contactMediums().find(cm => cm.type.toLowerCase() === 'email');
    return email ? email.value : '';
  }

  getMobilePhone(): string {
    const mobile = this.contactMediums().find(cm => cm.type.toLowerCase() === 'mobile_phone');
    return mobile ? mobile.value : '';
  }

  getHomePhone(): string {
    const home = this.contactMediums().find(cm => cm.type.toLowerCase() === 'home_phone');
    return home ? home.value : '';
  }

  getFax(): string {
    const fax = this.contactMediums().find(cm => cm.type.toLowerCase() === 'fax');
    return fax ? fax.value : '';
  }

  // Type label'ları düzenlemek için
  formatType(type: string): string {
    const typeMap: { [key: string]: string } = {
      'email': 'Email',
      'mobile_phone': 'Mobile Phone',
      'home_phone': 'Home Phone',
      'fax': 'Fax'
    };
    return typeMap[type.toLowerCase()] || type;
  }
}
