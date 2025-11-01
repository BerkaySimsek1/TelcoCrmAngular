import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CreateContactMediumRequest, ContactMedium } from '../../models/createContactMediumRequest';
import { CreatedContactMediumResponse } from '../../models/createdContactMediumResponse';
import { ContactMediumService } from '../../services/contactmedium-service';
import { FullCustomerCreationService } from '../../services/full-customer-creation-service';
import { CustomerOnboardingApi } from '../../services/customer-onboarding-api';
import { CreateFullCustomerRequest } from '../../models/createFullCustomerModels/createFullCustomerRequest';

@Component({
  selector: 'app-create-contactmedium-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-contactmedium-card.html',
  styleUrl: './create-contactmedium-card.scss',
})
export class CreateContactmediumCard implements OnInit {
  formGroup!: FormGroup;
  submitting = signal(false);

  createdContactMediumResponses = signal<CreatedContactMediumResponse[] | undefined>(undefined);

  // Contact medium types
  contactMediumTypes = [
    { value: 'email', label: 'Email' },
    { value: 'mobile_phone', label: 'Mobile Phone' },
    { value: 'home_phone', label: 'Home Phone' },
    { value: 'fax', label: 'Fax' }
  ];

  constructor(
    private fb: FormBuilder,
    private contactMediumService: ContactMediumService,
    private router: Router,
    private route: ActivatedRoute,
    private fullCustomerCreation: FullCustomerCreationService,
    private api: CustomerOnboardingApi
  ) {}

  ngOnInit(): void {

    this.buildForm();
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
          Validators.pattern(/^\+[1-9]\d{1,14}$/), // E.164 format: +countrycode + number
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

  submit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    

    // ContactMedium array'i oluştur
    const contactMediums: ContactMedium[] = [];

    // Email (zorunlu)
    contactMediums.push({
      type: 'email',
      value: this.f['email'].value,
      isPrimary: this.f['emailPrimary'].value
    });

    // Mobile Phone (zorunlu)
    contactMediums.push({
      type: 'mobile_phone',
      value: this.f['mobilePhone'].value,
      isPrimary: this.f['mobilePhonePrimary'].value
    });

    // Home Phone (opsiyonel)
    if (this.f['homePhone'].value) {
      contactMediums.push({
        type: 'home_phone',
        value: this.f['homePhone'].value,
        isPrimary: this.f['homePhonePrimary'].value
      });
    }

    // Fax (opsiyonel)
    if (this.f['fax'].value) {
      contactMediums.push({
        type: 'fax',
        value: this.f['fax'].value,
        isPrimary: this.f['faxPrimary'].value
      });
    }

    const cur = this.fullCustomerCreation.state();
    const next = { ...cur, contactMediums: contactMediums };
    this.fullCustomerCreation.state.set(next);

    // FINAL: tek API çağrısı
    if (!next.individual) {
      console.error('Wizard state individual yok.');
      return;
    }

    const req: CreateFullCustomerRequest = {
      individualCustomer: next.individual,
      addresses: next.addresses,
      contactMediums: next.contactMediums,
    };

    this.submitting.set(true);
    this.api.createFull(req).subscribe({
      next: (res) => {
        this.submitting.set(false);
        // Başarılı – istersen müşteri detayına yönlendir
        this.router.navigate(['/customer-info', res.customerId]);
        // ya da arama sayfasına dön:
        // this.router.navigate(['/search-list']);
        // State'i temizle:
        this.fullCustomerCreation.reset();
      },
      error: (err) => {
        console.error('Full customer create failed:', err);
        this.submitting.set(false);
      },
    });
  }

  cancel() {
    this.formGroup.reset({
      email: '',
      emailPrimary: false,
      mobilePhone: '',
      mobilePhonePrimary: false,
      homePhone: '',
      homePhonePrimary: false,
      fax: '',
      faxPrimary: false,
    });
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
