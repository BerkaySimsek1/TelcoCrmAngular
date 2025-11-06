import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CreateContactMediumRequest, ContactMedium } from '../../../models/ContactMediumModels/createContactMediumRequest';
import { CreatedContactMediumResponse } from '../../../models/ContactMediumModels/createdContactMediumResponse';
import { ContactMediumService } from '../../../services/contactmedium-service';
import { FullCustomerCreationService } from '../../../services/full-customer-creation-service';
import { CustomerOnboardingApi } from '../../../services/customer-onboarding-api';
import { CreateFullCustomerRequest } from '../../../models/createFullCustomerModels/createFullCustomerRequest';

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


    // 🔹 Var olan state’ten doldur
  const st = this.fullCustomerCreation.state();
  const existing = st.contactMediums ?? [];
  const email = existing.find(x => x.type === 'email');
  const mobile = existing.find(x => x.type === 'mobile_phone');
  const home = existing.find(x => x.type === 'home_phone');
  const fax = existing.find(x => x.type === 'fax');

  this.formGroup.patchValue({
    email: email?.value ?? '',
    emailPrimary: email?.isPrimary ?? false,
    mobilePhone: mobile?.value ?? '',
    mobilePhonePrimary: mobile?.isPrimary ?? false,
    homePhone: home?.value ?? '',
    homePhonePrimary: home?.isPrimary ?? false,
    fax: fax?.value ?? '',
    faxPrimary: fax?.isPrimary ?? false,
  }, { emitEvent: false });
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
  if (this.formGroup.invalid) { this.formGroup.markAllAsTouched(); return; }

  const contactMediums = this.buildContactMediumsFromForm();
  const cur = this.fullCustomerCreation.state();
  this.fullCustomerCreation.setContactMediums(contactMediums); // 🔑

  if (!cur.individual) {
    console.error('Wizard state individual yok.');
    return;
  }

  const req = {
    individualCustomer: cur.individual,
    addresses: cur.addresses,
    contactMediums: contactMediums,
  };

  this.submitting.set(true);
  this.api.createFull(req).subscribe({
    next: (res) => {
      this.submitting.set(false);
      this.router.navigate(['/customer', res.customerId]);
      this.fullCustomerCreation.reset(); // 🔑 wizard’ı temizle
    },
    error: (err) => { this.submitting.set(false); console.error(err); }
  });
}

  cancel() {
    const contactMediums = this.buildContactMediumsFromForm();
  this.fullCustomerCreation.setContactMediums(contactMediums);
  this.router.navigate(['/onboarding/addresses']);
  }

  private buildContactMediumsFromForm(): ContactMedium[] {
  const cms: ContactMedium[] = [];
  cms.push({ type: 'email', value: this.f['email'].value, isPrimary: this.f['emailPrimary'].value });
  cms.push({ type: 'mobile_phone', value: this.f['mobilePhone'].value, isPrimary: this.f['mobilePhonePrimary'].value });
  if (this.f['homePhone'].value) cms.push({ type: 'home_phone', value: this.f['homePhone'].value, isPrimary: this.f['homePhonePrimary'].value });
  if (this.f['fax'].value) cms.push({ type: 'fax', value: this.f['fax'].value, isPrimary: this.f['faxPrimary'].value });
  return cms;
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
