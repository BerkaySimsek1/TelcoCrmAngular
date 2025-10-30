import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressService } from '../../services/address-service';
import { CityResponse } from '../../models/cityResponse';
import { DistrictResponse } from '../../models/districtResponse';
import { UpdateAddressRequest } from '../../models/updateAddressRequest';
import { UpdatedAddressResponse } from '../../models/updatedAddressResponse';
import { AddressResponse } from '../../models/addressResponse';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-update-address-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './update-address-card.html',
  styleUrl: './update-address-card.scss',
})
export class UpdateAddressCard implements OnInit {

  formGroup!: FormGroup;
  submitting = signal(false);

  cities = signal<CityResponse[]>([]);
  districts = signal<DistrictResponse[]>([]);

  updatedAddressResponse = signal<UpdatedAddressResponse | undefined>(undefined);
  private addressId!: string;
  private customerId!: string;
  
  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.buildForm();

    // URL'den :customerId ve :addressId al
    const customerIdFromRoute = this.route.snapshot.paramMap.get('customerId');
    const addressIdFromRoute = this.route.snapshot.paramMap.get('addressId');
    
    if (!customerIdFromRoute || !addressIdFromRoute) {
      console.error('customerId veya addressId paramı bulunamadı.');
      return;
    }
    
    this.customerId = customerIdFromRoute;
    this.addressId = addressIdFromRoute;

    // Şehirleri ve adresleri paralel yükle
    forkJoin({
      cities: this.addressService.getCity(),
      addresses: this.addressService.getAddressByCustomerId(this.customerId)
    }).subscribe({
      next: ({ cities, addresses }) => {
        // Şehirleri signal ile kaydet
        const cityArray = Array.isArray(cities) ? cities : [cities];
        this.cities.set(cityArray);
        
        // Adresleri filtrele
        const addressList = Array.isArray(addresses) ? addresses : [addresses];
        const targetAddress = addressList.find((addr: any) => 
          String(addr.id) === this.addressId || String(addr.addressId) === this.addressId
        );
        
        if (targetAddress) {
          this.patchFormWithAddress(targetAddress);
        } else {
          console.error(`addressId ${this.addressId} ile eşleşen adres bulunamadı.`);
        }
      },
      error: (err) => console.error('Veri yükleme hatası:', err),
    });

    // City değişimlerini dinle
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

  private patchFormWithAddress(res: AddressResponse) {
    const districtId = res.districtId;

    this.formGroup.patchValue({
      districtId: districtId,
      street: res.street ?? '',
      houseNumber: res.houseNumber ?? '',
      description: res.description ?? null,
      default: res.default ?? false,
    });

    // cityName ile city listesinden city'yi bul
    if (res.cityName) {
      const matchedCity = this.cities().find(c => c.name === res.cityName);
      if (matchedCity) {
        this.formGroup.patchValue({ cityId: matchedCity.id });
        this.loadDistricts(matchedCity.id, districtId);
      } else {
        console.warn(`cityName '${res.cityName}' ile eşleşen şehir bulunamadı.`);
      }
    }
  }

  private loadDistricts(cityId: number, preselectedDistrictId?: number | null) {
    this.addressService.getDistrictByCityId(cityId).subscribe({
      next: (res) => {
        // Districts'i signal ile set et
        const districtArray = Array.isArray(res) ? res : [res];
        this.districts.set(districtArray);
        
        // District'leri yükledikten sonra enable et
        this.f['districtId'].enable();
        
        // Eğer önceden seçili bir district varsa onu set et
        if (preselectedDistrictId) {
          this.f['districtId'].setValue(preselectedDistrictId);
        }
      },
      error: (err) => {
        console.error('İlçeler alınamadı:', err);
        this.districts.set([]);
        this.f['districtId'].disable();
      },
    });
  }

  private handleCityChanges() {
    this.f['cityId'].valueChanges.subscribe((val: number | null) => {
      // City değişince district reset + disable
      this.f['districtId'].setValue(null);
      this.f['districtId'].disable();
      this.districts.set([]);
      
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
      console.error('customerId bulunamadı. UpdateAddressRequest için zorunlu.');
      return;
    }

    const req: UpdateAddressRequest = {
      street: this.f['street'].value,
      houseNumber: this.f['houseNumber'].value,
      description: this.f['description'].value ?? '',
      districtId: this.f['districtId'].value!,
      customerId: this.customerId,
      default: this.f['default'].value,
    };

    this.submitting.set(true);
    this.addressService.updateAddress(Number(this.addressId), req).subscribe({
      next: (response) => {
        this.updatedAddressResponse.set(response);
        this.submitting.set(false);

        // Adres güncelleme sonrası address list sayfasına dön
        this.router.navigate(['/address-list', this.customerId]);
      },
      error: (error) => {
        console.error('Adres güncellenirken hata:', error);
        this.submitting.set(false);
      },
    });
  }

  cancel() {
    // Cancel address list sayfasına dön
    if (this.customerId) {
      this.router.navigate(['/address-list', this.customerId]);
    } else {
      this.router.navigate(['/customers']);
    }
  }
}