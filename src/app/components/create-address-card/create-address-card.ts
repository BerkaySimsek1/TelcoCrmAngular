import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressService } from '../../services/address-service';
import { CityResponse } from '../../models/cityResponse';
import { DistrictResponse } from '../../models/districtResponse';
import { CreateAddressRequest } from '../../models/createAddressRequest';
import { CreatedAddressResponse } from '../../models/createdAddressResponse';
 
@Component({
  selector: 'app-create-address-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-address-card.html',
  styleUrl: './create-address-card.scss',
})
export class CreateAddressCard implements OnInit {
 
  formGroup!: FormGroup;
  submitting = signal(false);
 
  cities: CityResponse[] = [];
  districts: DistrictResponse[] = [];
 
  createdAddressResponse = signal<CreatedAddressResponse | undefined>(undefined);
  private customerId!: string;
  
  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
 
  ngOnInit(): void {
    // URL'den :customerId al
    const idFromRoute = this.route.snapshot.paramMap.get('customerId');
    if (!idFromRoute) {
      console.error('customerId paramı bulunamadı.');
      return;
    }
    this.customerId = idFromRoute;
    this.buildForm();
    this.loadCities();
    this.handleCityChanges();
  }
 
  private buildForm() {
    this.formGroup = this.fb.group({
      cityId: new FormControl<number | null>(null, { validators: [Validators.required] }),
      districtId: new FormControl<number | null>({ value: null, disabled: true }, { validators: [Validators.required] }),
      street: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(200)] }),
      houseNumber: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
      description: new FormControl<string | null>(null, { validators: [Validators.maxLength(500)] }),
      default: new FormControl<boolean>(false, { nonNullable: true }),
    });
  }
 
  get f() {
    return this.formGroup.controls;
  }
 
  private loadCities() {
    this.addressService.getCity().subscribe({
      next: (res) => {
        // API tek obje dönerse de diziye çevir.
        this.cities = Array.isArray(res) ? res : [res];
      },
      error: (err) => console.error('Şehirler alınamadı:', err),
    });
  }
 
  private loadDistricts(cityId: number) {
    this.addressService.getDistrictByCityId(cityId).subscribe({
      next: (res) => {
        this.districts = Array.isArray(res) ? res : [res];
        // District'leri yükledikten sonra enable et
        this.f['districtId'].enable();
      },
      error: (err) => {
        console.error('İlçeler alınamadı:', err);
        this.f['districtId'].disable();
      },
    });
  }
 
  private handleCityChanges() {
    this.f['cityId'].valueChanges.subscribe((val: number | null) => {
      // City değişince district reset + disable
      this.f['districtId'].setValue(null);
      this.f['districtId'].disable();
      this.districts = [];
      
      if (val != null) {
        this.loadDistricts(val);
      }
    });
  }
 
  submit() {
    // District disabled ise enable et ki validation çalışsın
    if (this.f['districtId'].disabled) {
      this.f['districtId'].enable();
    }
    
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }
 
    if (!this.customerId) {
      console.error('customerId bulunamadı. CreateAddressRequest için zorunlu.');
      return;
    }
 
    const req: CreateAddressRequest = {
      street: this.f['street'].value,
      houseNumber: this.f['houseNumber'].value,
      description: this.f['description'].value ?? '',
      districtId: this.f['districtId'].value!,
      customerId: this.customerId,
      default: this.f['default'].value,
    };
 
    this.submitting.set(true);
    this.addressService.createAddress(req).subscribe({
      next: (response) => {
        this.createdAddressResponse.set(response);
        this.submitting.set(false);
 
        // Adres kaydı sonrası istersen müşteri info sayfasına dön
        // this.router.navigate(['/customer-info', this.customerId]);
      },
      error: (error) => {
        console.error('Adres oluşturulurken hata:', error);
        this.submitting.set(false);
      },
    });
  }
 
  cancel() {
    this.formGroup.reset({
      cityId: null,
      districtId: null,
      street: '',
      houseNumber: '',
      description: null,
      default: false,
    });
    this.f['districtId'].disable();
    this.districts = [];
    this.createdAddressResponse.set(undefined);
  }
}