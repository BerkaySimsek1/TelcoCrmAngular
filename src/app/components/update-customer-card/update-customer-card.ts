import { Component, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UpdatedCustomerResponse } from '../../models/updatedCustomerResponse';
import { CustomerService } from '../../services/customer-service';
import { ActivatedRoute, Router } from '@angular/router';
import { UpdateCustomerRequest } from '../../models/updateCustomerRequest';
import { CommonModule } from '@angular/common';
import { CustomerResponse } from '../../models/customerResponse';

@Component({
  selector: 'app-update-customer-card',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-customer-card.html',
  styleUrl: './update-customer-card.scss',
})
export class UpdateCustomerCard {
  formGroup!: FormGroup;
  submitting = signal(false);
  updatedCustomerResponse = signal<UpdatedCustomerResponse | undefined>(undefined);
  private customerId!: string;

  constructor(private customerService: CustomerService,
     private formBuilder: FormBuilder, 
     private router: Router,
      private route: ActivatedRoute
    ) {
  }

    ngOnInit(): void {
    this.buildForm();

    // URL'den :customerId al
    const idFromRoute = this.route.snapshot.paramMap.get('customerId');
    if (!idFromRoute) {
      console.error('customerId paramı bulunamadı.');
      return;
    }
    this.customerId = idFromRoute;

    // Mevcut müşteri verisini çek ve forma bas
    this.customerService.getCustomerById(this.customerId).subscribe({
      next: (res: CustomerResponse) => {
        this.patchFormWithCustomer(res);
      },
      error: (err) => console.error('Müşteri bilgisi alınamadı:', err),
    });
  }

  private toDateInputValue(dateStr: string | null | undefined): string {
    if (!dateStr) return '';
    // Olası formatlar: "2025-10-08", "2025-10-08T00:00:00", "2025-10-08T00:00:00Z"
    const onlyDate = dateStr.split('T')[0];
    // Basit doğrulama
    return /^\d{4}-\d{2}-\d{2}$/.test(onlyDate) ? onlyDate : '';
  }

  private patchFormWithCustomer(res: CustomerResponse) {
    this.formGroup.patchValue({
      firstName: res.firstName ?? '',
      middleName: res.middleName ?? null,
      lastName: res.lastName ?? '',
      dateOfBirth: this.toDateInputValue(res.dateOfBirth), // <input type="date" için
      motherName: res.motherName ?? null,
      fatherName: res.fatherName ?? null,
      gender: (res.gender as any) ?? 'OTHER',
      nationalId: res.nationalId ?? '',
    });
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
    
          const request: UpdateCustomerRequest = {
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
          this.customerService.updateCustomer(this.customerId, request).subscribe({
            next: (response) => {
              this.updatedCustomerResponse.set(response);
    
              this.submitting.set(false);
    
               const id = (response as any).customerId ?? (response as any).id;
            if (id) {
              this.router.navigate(['/customer-info', id]); // /customer-info/:customerId
            } else {
              console.error('updateCustomer response customerId içermiyor.');
            }
    
            },
            error: (error) => {
              console.error('Müşteri güncellenirken hata oluştu:', error);
              this.submitting.set(false);
            }
          });
    
        }

        cancel() {
          this.router.navigate(['/customers']);
        }
}
