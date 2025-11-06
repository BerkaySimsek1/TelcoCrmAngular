import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AddressService } from '../../../services/address-service';
import { CityResponse } from '../../../models/AddressModels/cityResponse';
import { DistrictResponse } from '../../../models/AddressModels/districtResponse';
import { UpdateAddressRequest } from '../../../models/AddressModels/updateAddressRequest';
import { UpdatedAddressResponse } from '../../../models/AddressModels/updatedAddressResponse';
import { AddressResponse } from '../../../models/AddressModels/addressResponse';
import { forkJoin, of, switchMap } from 'rxjs';
import { FullCustomerCreationService } from '../../../services/full-customer-creation-service';
import { CreateFlowMode } from '../../../shared/create-flow-mode';
import { CreateAddressItem } from '../../../models/createFullCustomerModels/createAddressItem';

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

  // mode & identifiers
  mode!: CreateFlowMode;
  customerId: string | null = null;
  addressId: string | null = null; // standalone için
  tmpId: number | null = null;     // wizard için (idx+1 veya geçici id)

  constructor(
    private fb: FormBuilder,
    private addressService: AddressService,
    private fullCustomer: FullCustomerCreationService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

ngOnInit(): void {
  this.mode =
    (this.route.snapshot.data['mode'] as CreateFlowMode) ??
    (this.route.snapshot.paramMap.get('customerId') ? 'standalone' : 'wizard');

  this.buildForm();

  this.addressService.getCity().subscribe({
    next: (cities) => {
      this.cities.set(Array.isArray(cities) ? cities : [cities]);

      if (this.mode === 'wizard') {
        const tmpIdParam = this.route.snapshot.paramMap.get('tmpId');
        this.tmpId = tmpIdParam ? Number(tmpIdParam) : null;
        if (!this.tmpId) { console.error('tmpId bulunamadı'); return; }

        const list = this.fullCustomer.state().addresses || [];
        const idx = this.tmpId - 1;
        const item = list[idx];
        if (!item) { console.error('Wizard state içinde adres yok'); return; }

        // Wizard kolunda:
this.patchFormFromCreateItem(item);

if (item.cityId != null) {
  const cid = Number(item.cityId);
  this.formGroup.get('cityId')!.setValue(cid, { emitEvent: false }); // 🔑
  this.loadDistricts(cid, item.districtId);
} else {
  // yoksa fallback
  this.findCityByDistrictFallback(item.districtId ?? null);
}

this.handleCityChanges(); 

        this.handleCityChanges(); // listener
      } else {
        this.customerId = this.route.snapshot.paramMap.get('customerId');
        this.addressId = this.route.snapshot.paramMap.get('addressId');
        if (!this.customerId || !this.addressId) { console.error('customerId/addressId yok'); return; }

        this.addressService.getAddressByCustomerId(this.customerId).subscribe({
          next: (addresses) => {
            const list = Array.isArray(addresses) ? addresses : [addresses];
            const target = list.find((a: any) =>
              String(a.id) === this.addressId || String(a.addressId) === this.addressId
            );
            if (!target) { console.error('Adres bulunamadı'); return; }

            this.patchFormWithAddress(target); // street/house/desc/default/districtId

            // ✅ city çözümü
            if (target.cityName) {
              const matched = this.cities().find(c => c.name === target.cityName);
              if (matched) {
                this.formGroup.patchValue({ cityId: matched.id });
                this.loadDistricts(matched.id, target.districtId);
              } else {
                // cityName eşleşmediyse fallback
                this.findCityByDistrictFallback(target.districtId);
              }
            } else {
              // cityName yoksa fallback
              this.findCityByDistrictFallback(target.districtId);
            }

            this.handleCityChanges();
          },
          error: (err) => console.error('Adresler alınamadı:', err),
        });
      }
    },
    error: (err) => console.error('Şehirler alınamadı:', err),
  });
}

  private buildForm() {
    this.formGroup = this.fb.group({
      title: new FormControl<string | null>(null, { validators: [Validators.required] }),
      cityId: new FormControl<number | null>(null, { validators: [Validators.required] }),
      districtId: new FormControl<number | null>({ value: null, disabled: true }, { validators: [Validators.required] }),
      street: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(200)] }),
      houseNumber: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(50)] }),
      description: new FormControl<string | null>(null, { validators: [Validators.maxLength(500)] }),
      default: new FormControl<boolean>(false, { nonNullable: true }),
    });
  }

  get f() { return this.formGroup.controls; }

  private loadDistricts(cityId: number, preselectedDistrictId?: number | null) {
  this.addressService.getDistrictByCityId(cityId).subscribe({
    next: (res) => {
      const arr = (Array.isArray(res) ? res : [res]) as DistrictResponse[];
      this.districts.set(arr);
      this.f['districtId'].enable();

      if (preselectedDistrictId != null) {
        const wanted = Number(preselectedDistrictId);
        const exists = arr.some(d => Number(d.id) === wanted);  // ✅
        this.f['districtId'].setValue(exists ? wanted : null);
      }
    },
    error: () => {
      this.districts.set([]);
      this.f['districtId'].disable();
    },
  });
}


private findCityByDistrictFallback(districtId?: number | null) {
  if (districtId == null) return;
  const wanted = Number(districtId);
  const cities = this.cities();

  const tryNext = (i: number) => {
    if (i >= cities.length) return;              // bulunamadı
    const city = cities[i];

    this.addressService.getDistrictByCityId(city.id).subscribe({
      next: (res) => {
        const arr = (Array.isArray(res) ? res : [res]) as DistrictResponse[];
        const match = arr.some(d => Number(d.id) === wanted);  // ✅ tip güvenli eşleşme
        if (match) {
          this.formGroup.patchValue({ cityId: city.id });
          this.districts.set(arr);
          this.f['districtId'].enable();
          this.f['districtId'].setValue(wanted);
        } else {
          tryNext(i + 1);
        }
      },
      error: () => tryNext(i + 1),
    });
  };

  tryNext(0);
}

  // Wizard: CreateAddressItem'tan forma bas
  private patchFormFromCreateItem(item: CreateAddressItem) {
  this.formGroup.patchValue({
    title: item.title?? '',
    street: item.street ?? '',
    houseNumber: item.houseNumber ?? '',
    description: item.description ?? null,
    default: item.default ?? false,
    districtId: item.districtId ?? null
  });
}

  // Standalone: AddressResponse'tan forma bas
  private patchFormWithAddress(res: AddressResponse) {
  this.formGroup.patchValue({
    title: res.title?? '',
    street: res.street ?? '',
    houseNumber: res.houseNumber ?? '',
    description: res.description ?? null,
    default: res.default ?? false,
    districtId: res.districtId ?? null
  });
}

  private handleCityChanges() {
    this.f['cityId'].valueChanges.subscribe((val: number | null) => {
      this.f['districtId'].setValue(null);
      this.f['districtId'].disable();
      this.districts.set([]);
      if (val != null) {
        this.addressService.getDistrictByCityId(val).subscribe({
          next: (res) => {
            this.districts.set(Array.isArray(res) ? res : [res]);
            this.f['districtId'].enable();
          },
          error: (err) => {
            console.error('İlçeler alınamadı:', err);
            this.f['districtId'].disable();
          },
        });
      }
    });
  }

  submit() {
    if (this.f['districtId'].disabled) this.f['districtId'].enable();
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    const payload = {
      title:this.f['title'].value,
      street: this.f['street'].value,
      houseNumber: this.f['houseNumber'].value,
      description: this.f['description'].value ?? '',
      districtId: this.f['districtId'].value!,
      default: this.f['default'].value,
    };

    this.submitting.set(true);

    if (this.mode === 'wizard') {
      // STATE içinde güncelle
      if (!this.tmpId) {
        console.error('tmpId yok (wizard update).');
        this.submitting.set(false);
        return;
      }
      const idx = this.tmpId - 1; // geçici id mantığın buysa
      const state = this.fullCustomer.state();
      const list = [...(state.addresses || [])];

      if (!list[idx]) {
        console.error('Wizard adres listesinde index bulunamadı.');
        this.submitting.set(false);
        return;
      }
      // CreateAddressItem tipinde update
      list[idx] = { ...list[idx], ...payload };

      this.fullCustomer.state.set({ ...state, addresses: list });
      this.submitting.set(false);
      this.router.navigateByUrl('/onboarding/addresses');
      return;
    }

    // Standalone: API PUT
    if (!this.customerId || !this.addressId) {
      console.error('customerId/addressId yok (standalone update).');
      this.submitting.set(false);
      return;
    }

    const req: UpdateAddressRequest = {
      ...payload,
      customerId: this.customerId
    };

    this.addressService.updateAddress(Number(this.addressId), req).subscribe({
      next: (response) => {
        this.updatedAddressResponse.set(response);
        this.submitting.set(false);
        this.router.navigate(['/customer', this.customerId, 'addresses']);
      },
      error: (error) => {
        console.error('Adres güncellenirken hata:', error);
        this.submitting.set(false);
      },
    });
  }

  cancel() {
    if (this.mode === 'wizard') {
      this.router.navigateByUrl('/onboarding/addresses');
    } else {
      if (this.customerId) {
        this.router.navigate(['/customer', this.customerId, 'addresses']);
      } else {
        this.router.navigateByUrl('/customers');
      }
    }
  }
}
