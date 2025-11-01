import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ContactMediumService } from '../../services/contactmedium-service';
import { UpdateContactMediumRequest, UpdateContactMedium } from '../../models/updateContactMediumRequest';
import { UpdatedContactMediumResponse } from '../../models/updatedContactMediumResponse';
import { ContactMediumResponse } from '../../models/contactMediumResponse';

@Component({
  selector: 'app-update-contactmedium-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-contactmedium-card.html',
  styleUrl: './update-contactmedium-card.scss',
})
export class UpdateContactmediumCard implements OnInit {
  formGroup!: FormGroup;
  submitting = signal(false);

  updatedContactMediumResponse = signal<UpdatedContactMediumResponse | undefined>(undefined);
  private customerId!: string;

  // Contact mediums'ları saklamak için (id bilgisi ile)
  private existingContactMediums: ContactMediumResponse[] = [];

  constructor(
    private fb: FormBuilder,
    private contactMediumService: ContactMediumService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buildForm();

    // URL'den :customerId al
    const customerIdFromRoute = this.route.snapshot.paramMap.get('customerId');
    
    if (!customerIdFromRoute) {
      console.error('customerId paramı bulunamadı.');
      return;
    }
    
    this.customerId = customerIdFromRoute;

    // Mevcut contact mediums'ları yükle
    this.loadContactMediums();
  }

  private buildForm() {
    this.formGroup = this.fb.group({
      email: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.email, Validators.maxLength(150)]
      }),
      emailPrimary: new FormControl<boolean>(false, { nonNullable: true }),

      mobilePhone: new FormControl<string>('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/^\+[1-9]\d{1,14}$/),
          Validators.maxLength(150)
        ]
      }),
      mobilePhonePrimary: new FormControl<boolean>(false, { nonNullable: true }),

      homePhone: new FormControl<string>('', {
        validators: [
          Validators.maxLength(150)
        ]
      }),
      homePhonePrimary: new FormControl<boolean>(false, { nonNullable: true }),

      fax: new FormControl<string>('', {
        validators: [
          Validators.maxLength(150)
        ]
      }),
      faxPrimary: new FormControl<boolean>(false, { nonNullable: true }),
    });
  }

  get f() {
    return this.formGroup.controls;
  }

  private loadContactMediums() {
    this.contactMediumService.getContactMediumsById(this.customerId).subscribe({
      next: (response) => {
        this.existingContactMediums = Array.isArray(response) ? response : [response];
        this.patchFormWithContactMediums();
      },
      error: (err) => console.error('Contact mediums alınamadı:', err),
    });
  }

  private patchFormWithContactMediums() {
    // Email
    const email = this.existingContactMediums.find(cm => cm.type.toLowerCase() === 'email');
    if (email) {
      this.formGroup.patchValue({
        email: email.value,
        emailPrimary: email.isPrimary
      });
    }

    // Mobile Phone
    const mobilePhone = this.existingContactMediums.find(cm => cm.type.toLowerCase() === 'mobile_phone');
    if (mobilePhone) {
      this.formGroup.patchValue({
        mobilePhone: mobilePhone.value,
        mobilePhonePrimary: mobilePhone.isPrimary
      });
    }

    // Home Phone
    const homePhone = this.existingContactMediums.find(cm => cm.type.toLowerCase() === 'home_phone');
    if (homePhone) {
      this.formGroup.patchValue({
        homePhone: homePhone.value,
        homePhonePrimary: homePhone.isPrimary
      });
    }

    // Fax
    const fax = this.existingContactMediums.find(cm => cm.type.toLowerCase() === 'fax');
    if (fax) {
      this.formGroup.patchValue({
        fax: fax.value,
        faxPrimary: fax.isPrimary
      });
    }
  }

  submit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    if (!this.customerId) {
      console.error('customerId bulunamadı. UpdateContactMediumRequest için zorunlu.');
      return;
    }

    // UpdateContactMedium array'i oluştur (id'leri dahil et)
    const contactMediums: UpdateContactMedium[] = [];

    // Email (zorunlu) - ID'sini bul
    const emailId = this.existingContactMediums.find(cm => cm.type.toLowerCase() === 'email')?.id;
    if (emailId) {
      contactMediums.push({
        id: emailId,
        type: 'email',
        value: this.f['email'].value,
        isPrimary: this.f['emailPrimary'].value
      });
    }

    // Mobile Phone (zorunlu) - ID'sini bul
    const mobilePhoneId = this.existingContactMediums.find(cm => cm.type.toLowerCase() === 'mobile_phone')?.id;
    if (mobilePhoneId) {
      contactMediums.push({
        id: mobilePhoneId,
        type: 'mobile_phone',
        value: this.f['mobilePhone'].value,
        isPrimary: this.f['mobilePhonePrimary'].value
      });
    }

    // Home Phone (opsiyonel) - ID'sini bul
    if (this.f['homePhone'].value) {
      const homePhoneId = this.existingContactMediums.find(cm => cm.type.toLowerCase() === 'home_phone')?.id;
      if (homePhoneId) {
        contactMediums.push({
          id: homePhoneId,
          type: 'home_phone',
          value: this.f['homePhone'].value,
          isPrimary: this.f['homePhonePrimary'].value
        });
      }
    }

    // Fax (opsiyonel) - ID'sini bul
    if (this.f['fax'].value) {
      const faxId = this.existingContactMediums.find(cm => cm.type.toLowerCase() === 'fax')?.id;
      if (faxId) {
        contactMediums.push({
          id: faxId,
          type: 'fax',
          value: this.f['fax'].value,
          isPrimary: this.f['faxPrimary'].value
        });
      }
    }

    const req: UpdateContactMediumRequest = {
      customerId: this.customerId,
      contactMediums: contactMediums
    };

    this.submitting.set(true);
    this.contactMediumService.updateContactMedium(req).subscribe({
      next: (response) => {
        this.updatedContactMediumResponse.set(response);
        this.submitting.set(false);

        // Güncelleme sonrası contact medium info sayfasına dön
        this.router.navigate(['/customer', this.customerId, 'contact']);
      },
      error: (error) => {
        console.error('İletişim bilgileri güncellenirken hata:', error);
        this.submitting.set(false);
      },
    });
  }

  cancel() {
    // Cancel ile contact medium info sayfasına dön
    if (this.customerId) {
      this.router.navigate(['/customer', this.customerId, 'contact']);

    } else {
      this.router.navigate(['/customers']);
    }
  }

  // Helper metodlar - validation mesajları için
  getEmailErrorMessage(): string {
    const control = this.f['email'];
    if (control.hasError('required')) {
      return 'Email is required';
    }
    if (control.hasError('email')) {
      return 'Invalid email format';
    }
    if (control.hasError('maxlength')) {
      return 'Email must not exceed 150 characters';
    }
    return '';
  }

  getMobilePhoneErrorMessage(): string {
    const control = this.f['mobilePhone'];
    if (control.hasError('required')) {
      return 'Mobile phone is required';
    }
    if (control.hasError('pattern')) {
      return 'Mobile phone must start with country code (e.g., +905331234567)';
    }
    if (control.hasError('maxlength')) {
      return 'Mobile phone must not exceed 150 characters';
    }
    return '';
  }

  getHomePhoneErrorMessage(): string {
    const control = this.f['homePhone'];
    if (control.hasError('maxlength')) {
      return 'Home phone must not exceed 150 characters';
    }
    return '';
  }

  getFaxErrorMessage(): string {
    const control = this.f['fax'];
    if (control.hasError('maxlength')) {
      return 'Fax must not exceed 150 characters';
    }
    return '';
  }
}