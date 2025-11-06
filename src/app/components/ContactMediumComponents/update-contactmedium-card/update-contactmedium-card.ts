import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ContactMediumService } from '../../../services/contactmedium-service';
import { UpdateContactMediumRequest, UpdateContactMedium } from '../../../models/ContactMediumModels/updateContactMediumRequest';
import { UpdatedContactMediumResponse } from '../../../models/ContactMediumModels/updatedContactMediumResponse';
import { ContactMediumResponse } from '../../../models/ContactMediumModels/contactMediumResponse';

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
  if (!this.customerId) return;

  const cms: UpdateContactMedium[] = [];

  const pushUpsert = (type: string, value: string, isPrimary: boolean) => {
    // o tipte mevcut var mı?
    const existing = this.existingContactMediums.find(cm => cm.type.toLowerCase() === type);
    if (value && value.trim().length > 0) {
      // değer girilmiş → update (id varsa) veya create (id yoksa)
      cms.push({
        id: existing?.id, // yoksa undefined kalsın → backend create
        type,
        value: value.trim(),
        isPrimary
      });
    } else if (existing?.id) {
      // değer temizlendiyse (silmek istiyor olabilir) → opsiyon: delete kuyruğu
      // Şimdilik boş bırakıyoruz (silme API'niz varsa burada delete'e gönderin)
    }
  };

  pushUpsert('email', this.f['email'].value, this.f['emailPrimary'].value);
  pushUpsert('mobile_phone', this.f['mobilePhone'].value, this.f['mobilePhonePrimary'].value);
  pushUpsert('home_phone', this.f['homePhone'].value, this.f['homePhonePrimary'].value);
  pushUpsert('fax', this.f['fax'].value, this.f['faxPrimary'].value);

  const req: UpdateContactMediumRequest = {
    customerId: this.customerId,
    contactMediums: cms
  };

  this.submitting.set(true);
  this.contactMediumService.updateContactMedium(req).subscribe({
    next: (res) => {
      this.updatedContactMediumResponse.set(res);
      this.submitting.set(false);
      this.router.navigate(['/customer', this.customerId, 'contact']);
    },
    error: (e) => {
      console.error('Update error:', e);
      this.submitting.set(false);
    }
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