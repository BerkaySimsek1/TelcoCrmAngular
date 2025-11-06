import { Component, OnInit, signal } from '@angular/core';
import { CreatedCustomerRespose } from '../../../models/CustomerModels/createdCustomerResponse';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../../services/customer-service';
import { CommonModule } from '@angular/common';
import { CreateCustomerRequest } from '../../../models/CustomerModels/createCustomerRequest';
import { Router } from '@angular/router';
import { lettersOnlyValidator, nationalIdRulesValidator, nationalIdUniqueAsyncValidator } from '../../../validators/customer-validators';
import { FullCustomerCreationService } from '../../../services/full-customer-creation-service';

@Component({
  selector: 'app-create-customer-card',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-customer-card.html',
  styleUrl: './create-customer-card.scss',
})
export class CreateCustomerCard implements OnInit {
formGroup!: FormGroup;
submitting = signal(false);
  createdCustomerResponse = signal<CreatedCustomerRespose | undefined>(undefined);

  showCancelModal = signal<boolean>(false);

    constructor(private customerService: CustomerService, private fullCustomerCreation: FullCustomerCreationService, private formBuilder: FormBuilder, private router: Router) {
    }

    ngOnInit(): void {
        this.buildForm();

        const st = this.fullCustomerCreation.state();
  if (st.individual) {
    this.formGroup.patchValue({
      firstName: st.individual.firstName ?? '',
      middleName: st.individual.middleName ?? null,
      lastName: st.individual.lastName ?? '',
      dateOfBirth: (st.individual.dateOfBirth ?? '').slice(0,10), // "YYYY-MM-DD"
      motherName: st.individual.motherName ?? null,
      fatherName: st.individual.fatherName ?? null,
      gender: st.individual.gender ?? 'OTHER',
      nationalId: st.individual.nationalId ?? '',
    }, { emitEvent: false });
  }
    }


    buildForm() {
      this.formGroup = this.formBuilder.group({
        firstName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, lettersOnlyValidator(2, 50)] }),
      middleName: new FormControl<string | null>(null, { validators: lettersOnlyValidator(2, 50) }),
      lastName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, lettersOnlyValidator(2, 50)] }),
      dateOfBirth: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      motherName: new FormControl<string | null>(null, { validators: [lettersOnlyValidator(2, 50)] }),
      fatherName: new FormControl<string | null>(null, { validators: [lettersOnlyValidator(2, 50)] }),
      gender: new FormControl<'MALE' | 'FEMALE' | 'OTHER'>('OTHER', { nonNullable: true, validators: [Validators.required] }),
      nationalId: new FormControl<string>('', {
        nonNullable: true,
        validators: [
          Validators.required,
          nationalIdRulesValidator(),
        ],
        asyncValidators: [nationalIdUniqueAsyncValidator(this.customerService)],
        updateOn: 'blur',
      }),
      })
    }

    get f() {
      return this.formGroup.controls;
    }

    

    submit() {
      if(this.formGroup.invalid) {
        this.formGroup.markAllAsTouched();
        return;
      }

      if (this.f['nationalId'].errors?.['nationalIdTaken']) {
      // FR4 mesajını göstermek için küçük bir bayrak/alan kullanabiliriz.
      // Burada form hatalarında göstereceğiz (HTML’de ayrı blok var).
      this.formGroup.markAllAsTouched();
      return;
    }

      const dobDate: string = this.f['dateOfBirth'].value;
  const request: CreateCustomerRequest = {
    firstName: this.f['firstName'].value,
    middleName: this.f['middleName'].value ?? null,
    lastName: this.f['lastName'].value,
    dateOfBirth: `${dobDate}T00:00:00`,
    motherName: this.f['motherName'].value ?? null,
    fatherName: this.f['fatherName'].value ?? null,
    gender: this.f['gender'].value,
    nationalId: this.f['nationalId'].value,
  };

  this.submitting.set(true);
  this.fullCustomerCreation.setIndividual(request);  // 🔑 kalıcı state
  this.router.navigate(['/onboarding/addresses']);
    }

    cancel() {
    this.showCancelModal.set(true);
  }
  confirmCancel() {
    // formu sıfırla
    this.formGroup.reset({
      firstName: '',
      middleName: null,
      lastName: '',
      dateOfBirth: '',
      motherName: null,
      fatherName: null,
      gender: 'OTHER',
      nationalId: '',
    });
    this.createdCustomerResponse.set(undefined);
    this.showCancelModal.set(false);
    // Arama ekranına dön
    this.router.navigate(['/search-list']);
  }
  closeCancelModal() {
    this.showCancelModal.set(false);
  }

  has(name: keyof typeof this.formGroup.controls, error: string) {
  const c = this.formGroup.get(name as string);
  return !!(c && c.touched && c.hasError(error));
  }

}
