import { Component, signal, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UpdatedCustomerResponse } from '../../../models/CustomerModels/updatedCustomerResponse';
import { CustomerService } from '../../../services/customer-service';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateCustomerRequest } from '../../../models/CustomerModels/updateCustomerRequest';
import { CommonModule } from '@angular/common';
import { CustomerResponse } from '../../../models/CustomerModels/customerResponse';

import {
  lettersOnlyValidator,
  notFutureDateValidator,
  nationalIdRulesValidator,
  nationalIdUniqueForUpdateAsyncValidator
} from '../../../validators/customer-validators';

@Component({
  selector: 'app-update-customer-card',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-customer-card.html',
  styleUrl: './update-customer-card.scss',
})
export class UpdateCustomerCard implements OnInit {
  formGroup!: FormGroup;
  submitting = signal(false);
  updatedCustomerResponse = signal<UpdatedCustomerResponse | undefined>(undefined);
  private customerId!: string;

  private originalNationalId: string | null = null;

  constructor(
    private customerService: CustomerService,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buildForm();

    const idFromRoute = this.route.snapshot.paramMap.get('customerId');
    if (!idFromRoute) {
      console.error('customerId paramı bulunamadı.');
      return;
    }
    this.customerId = idFromRoute;

    // mevcut veriyi çek
    this.customerService.getCustomerById(this.customerId).subscribe({
      next: (res: CustomerResponse) => {
        this.originalNationalId = (res.nationalId ?? '').trim() || null;
        this.patchFormWithCustomer(res);

        // TCKN benzersizlik (kendisini hariç tut)
        const natCtrl = this.f['nationalId'];
        natCtrl.setAsyncValidators([
          nationalIdUniqueForUpdateAsyncValidator(
            this.customerService,
            () => this.originalNationalId
          )
        ]);
        natCtrl.updateValueAndValidity({ emitEvent: false });
      },
      error: (err) => console.error('Müşteri bilgisi alınamadı:', err),
    });
  }

  private toDateInputValue(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    const onlyDate = dateStr.split('T')[0];
    return /^\d{4}-\d{2}-\d{2}$/.test(onlyDate) ? onlyDate : '';
  }

  private patchFormWithCustomer(res: CustomerResponse) {
    this.formGroup.patchValue({
      firstName: res.firstName ?? '',
      middleName: res.middleName ?? null,
      lastName: res.lastName ?? '',
      dateOfBirth: this.toDateInputValue(res.dateOfBirth),
      motherName: res.motherName ?? null,
      fatherName: res.fatherName ?? null,
      gender: (res.gender as any) ?? 'OTHER',
      nationalId: res.nationalId ?? '',
    });
  }

  buildForm() {
    this.formGroup = this.formBuilder.group({
      firstName: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, lettersOnlyValidator(2, 50)],
      }),
      middleName: new FormControl<string | null>(null, {
        validators: [lettersOnlyValidator(2, 50)],
      }),
      lastName: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, lettersOnlyValidator(2, 50)],
      }),
      dateOfBirth: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, notFutureDateValidator()],
      }),
      motherName: new FormControl<string | null>(null, {
        validators: [lettersOnlyValidator(2, 50)],
      }),
      fatherName: new FormControl<string | null>(null, {
        validators: [lettersOnlyValidator(2, 50)],
      }),
      gender: new FormControl<'MALE' | 'FEMALE' | 'OTHER'>('OTHER', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      nationalId: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, nationalIdRulesValidator()],
      }),
    });
  }

  get f() {
    return this.formGroup.controls;
  }

  async submit() {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    // async kontrol kesinleşsin
    await this.f['nationalId'].updateValueAndValidity({ onlySelf: true, emitEvent: false });
    if (this.f['nationalId'].errors?.['nationalIdTaken']) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const dobDate: string = this.f['dateOfBirth'].value;
    const dateTime = `${dobDate}T00:00:00`;

    const request: UpdateCustomerRequest = {
      firstName: this.f['firstName'].value.trim(),
      middleName: (this.f['middleName'].value ?? null)?.trim() || null,
      lastName: this.f['lastName'].value.trim(),
      dateOfBirth: dateTime,
      motherName: (this.f['motherName'].value ?? null)?.trim() || null,
      fatherName: (this.f['fatherName'].value ?? null)?.trim() || null,
      gender: this.f['gender'].value,
      nationalId: this.f['nationalId'].value,
    };

    this.submitting.set(true);
    this.customerService.updateCustomer(this.customerId, request).subscribe({
      next: (response) => {
        this.updatedCustomerResponse.set(response);
        this.submitting.set(false);

        const id = (response as any).customerId ?? (response as any).id ?? this.customerId;
        this.router.navigate(['/customer', this.customerId, 'info']);
      },
      error: (error) => {
        console.error('Müşteri güncellenirken hata oluştu:', error);
        this.submitting.set(false);
      }
    });
  }

  cancel() {
    this.router.navigate(['/customer', this.customerId, 'info']);
  }

  has(name: keyof typeof this.formGroup.controls, error?: string) {
  const c = this.formGroup.get(name as string);
  if (!c) return false;
  const shouldShow = c.invalid && (c.dirty || c.touched); // <-- kritik kısım
  return error ? (!!c.errors?.[error] && shouldShow) : shouldShow;
}

  get isSaveDisabled(): boolean {
  // formGroup.pending: herhangi bir async validator çalışıyorsa true
  // nationalId specific kontrol: daha net görünsün diye ayrıca tuttum
  const natIdPending = this.f['nationalId']?.pending ?? false;
  return this.submitting() || natIdPending || this.formGroup.pending || this.formGroup.invalid;
}

isInvalid(name: keyof typeof this.formGroup.controls) {
  const c = this.formGroup.get(name as string);
  return !!(c && c.invalid && (c.dirty || c.touched));
}

}
