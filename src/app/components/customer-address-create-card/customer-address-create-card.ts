import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressService } from '../../services/address-service';
import { CityResponse } from '../../models/cityResponse';
import { DistrictResponse } from '../../models/districtResponse';
import { CreateAddressRequest } from '../../models/createAddressRequest';
import { CreatedAddressResponse } from '../../models/createdAddressResponse';
import { FullCustomerCreationService } from '../../services/full-customer-creation-service';
import { CreateAddressItem } from '../../models/createFullCustomerModels/createAddressItem';
import { CreateFlowMode } from '../../shared/create-flow-mode';

@Component({
  selector: 'app-create-address-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './customer-address-create-card.html',
  styleUrls: ['./customer-address-create-card.scss'],
})
export class CustomerAddressCreateCard implements OnInit {
  formGroup!: FormGroup;
  submitting = signal(false);

  cities = signal<CityResponse[]>([]);
  districts = signal<DistrictResponse[]>([]);

  createdAddressResponse = signal<CreatedAddressResponse | undefined>(undefined);

  mode!: CreateFlowMode;
  customerId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private fullCustomerCreation: FullCustomerCreationService,
    private router: Router,
    private route: ActivatedRoute,
    private addressService: AddressService
  ) { }

  ngOnInit(): void {
    this.mode = (this.route.snapshot.data['mode'] as CreateFlowMode) ?? 'standalone';
    this.customerId = this.route.snapshot.paramMap.get('customerId');
    this.buildForm();
    this.loadCities();
    this.handleCityChanges();
  }

  private buildForm() {
    this.formGroup = this.fb.group({
      title: new FormControl<string | null>(null, { validators: [Validators.required] }),
      cityId: new FormControl<number | null>(null, { validators: [Validators.required] }),
      districtId: new FormControl<number | null>(
        { value: null, disabled: true },
        { validators: [Validators.required] }
      ),
      street: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(200)],
      }),
      houseNumber: new FormControl<string>('', {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(50)],
      }),
      description: new FormControl<string | null>(null, {
        validators: [Validators.maxLength(500)],
      }),
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
        const cityArray = Array.isArray(res) ? res : [res];
        this.cities.set(cityArray);
      },
      error: (err) => console.error('Şehirler alınamadı:', err),
    });
  }

  private loadDistricts(cityId: number) {
    this.addressService.getDistrictByCityId(cityId).subscribe({
      next: (res) => {
        const districtArray = Array.isArray(res) ? res : [res];
        this.districts.set(districtArray);
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
      this.districts.set([]);

      if (val != null) {
        this.loadDistricts(val);
      }
    });
  }

  submit() {
    if (this.f['districtId'].disabled) this.f['districtId'].enable();
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const addrItem: CreateAddressItem = {
      title: this.f['title'].value,
      cityId: this.f['cityId'].value!, // ✅ eklendi
      street: this.f['street'].value,
      houseNumber: this.f['houseNumber'].value,
      description: this.f['description'].value ?? '',
      districtId: this.f['districtId'].value!,
      default: this.f['default'].value,
    };

    this.submitting.set(true);

    if (this.mode === 'wizard') {
      // STATE’e ekle, backend’e YOLLAMA
      const cur = this.fullCustomerCreation.state();
      this.fullCustomerCreation.state.set({ ...cur, addresses: [...cur.addresses, addrItem] });
      this.submitting.set(false);
      this.router.navigate(['/onboarding/addresses']); // listeye dön (state’ten görünür)
      return;
    }

    // STANDALONE: direkt backend’e POST
    if (!this.customerId) {
      console.error('customerId yok (standalone).');
      this.submitting.set(false);
      return;
    }

    const req: CreateAddressRequest = {
      title: addrItem.title,
      street: addrItem.street,
      houseNumber: addrItem.houseNumber,
      description: addrItem.description,
      districtId: addrItem.districtId,
      customerId: this.customerId,
      default: addrItem.default,
    };

    const returnTo = this.route.snapshot.queryParamMap.get('returnTo');

    this.addressService.createAddress(req).subscribe({
      next: (response) => {
        this.createdAddressResponse.set(response);
        this.submitting.set(false);
        const createdId = (response as any)?.id ?? (response as any)?.addressId;

        if (returnTo) {
          // Billing sayfasına dön ve yeni adresi otomatik seçtir
          this.router.navigateByUrl(returnTo, { state: { createdAddressId: createdId } });
        } else {
          // klasik davranış
          this.router.navigate(['/customer', this.customerId, 'addresses']);
        } // listeye dön
      },
      error: (error) => {
        console.error('Adres oluşturulurken hata:', error);
        this.submitting.set(false);
      },
    });
  }

  cancel() {
    if (this.mode === 'wizard') {
      this.router.navigate(['/onboarding/addresses']);
    } else {
      // Standalone: returnTo varsa oraya dön
      const returnTo = this.route.snapshot.queryParamMap.get('returnTo');
      if (returnTo) {
        this.router.navigateByUrl(returnTo);
        return;
      }

      // Aksi halde müşteri adres listesine dön (navbar altında)
      if (this.customerId) {
        this.router.navigate(['/customer', this.customerId, 'addresses']);
      } else {
        this.router.navigate(['/search-list']);
      }
    }
  }
}
