import { Component, OnInit, signal } from '@angular/core';
import { CreatedCustomerRespose } from '../../models/createdCustomerResponse';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CustomerService } from '../../services/customer-service';
import { CommonModule } from '@angular/common';
import { CreateCustomerRequest } from '../../models/createCustomerRequest';
import { Router } from '@angular/router';

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

    constructor(private customerService: CustomerService, private formBuilder: FormBuilder, private router: Router) {
    }

    ngOnInit(): void {
        this.buildForm();
    }


    buildForm() {
      this.formGroup = this.formBuilder.group({
        firstName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
      middleName: new FormControl<string | null>(null, { validators: [Validators.maxLength(50)] }),
      lastName: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
      dateOfBirth: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
      motherName: new FormControl<string | null>(null, { validators: [Validators.maxLength(50)] }),
      fatherName: new FormControl<string | null>(null, { validators: [Validators.maxLength(50)] }),
      gender: new FormControl<'MALE' | 'FEMALE' | 'OTHER'>('OTHER', { nonNullable: true, validators: [Validators.required] }),
      nationalId: new FormControl<string>('', {
        nonNullable: true,
        validators: [
          Validators.required,
          Validators.pattern(/^\d{11}$/),
        ],
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

      const dobDate: string = this.f['dateOfBirth'].value; // "2025-10-08"

      const dateTime = `${dobDate}T00:00:00`; 

      const request: CreateCustomerRequest = {
      firstName: this.f['firstName'].value,
      middleName: this.f['middleName'].value ?? null,
      lastName: this.f['lastName'].value,
      dateOfBirth: dateTime, // backend LocalDate istiyorsa "YYYY-MM-DD" tamam; LocalDateTime istiyorsa ISO'ya çevir.
      motherName: this.f['motherName'].value ?? null,
      fatherName: this.f['fatherName'].value ?? null,
      gender: this.f['gender'].value,
      nationalId: this.f['nationalId'].value,
      };

      this.submitting.set(true);
      this.customerService.createCustomer(request).subscribe({
        next: (response) => {
          this.createdCustomerResponse.set(response);

          this.submitting.set(false);

           const id = (response as any).customerId ?? (response as any).id;
        if (id) {
          this.router.navigate(['/customer-info', id]); // /customer-info/:customerId
        } else {
          console.error('createCustomer response customerId içermiyor.');
        }

        },
        error: (error) => {
          console.error('Müşteri oluşturulurken hata oluştu:', error);
          this.submitting.set(false);
        }
      });

    }

    cancel() {
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
  }
}
