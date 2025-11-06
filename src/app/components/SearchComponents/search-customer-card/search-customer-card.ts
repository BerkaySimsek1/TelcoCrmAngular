import { Component, EventEmitter, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

type SearchForm = {
  natId: FormControl<string>;
  customerId: FormControl<string>;
  accountNumber: FormControl<string>;
  gsmNumber: FormControl<string>;
  firstName: FormControl<string>;
  lastName: FormControl<string>;
  orderNumber: FormControl<string>;
};

@Component({
  selector: 'app-search-customer-card',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './search-customer-card.html'
})
export class SearchCustomerCard implements OnInit, OnDestroy {
  @Output() searchClicked = new EventEmitter<{
  natId?: string;
  customerId?: string;
  accountNumber?: string;
  gsmNumber?: string;
  firstName?: string;
  lastName?: string;
  orderNumber?: string;
}>();
  @Output() cleared = new EventEmitter<void>();

  form!: FormGroup<SearchForm>;
  private subs: Subscription[] = [];
  // ACC-4: başlangıçta pasif
  canSearch = signal(false);

  // “tekil kimlik” grubu (ACC-2)
  private idKeys: (keyof SearchForm)[] = ['natId', 'customerId', 'accountNumber', 'gsmNumber', 'orderNumber'];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.nonNullable.group({
      // ACC-1 sırası
      natId: this.fb.nonNullable.control<string>(''),
      customerId: this.fb.nonNullable.control<string>(''),
      accountNumber: this.fb.nonNullable.control<string>(''),
      gsmNumber: this.fb.nonNullable.control<string>(''),
      firstName: this.fb.nonNullable.control<string>(''),
      lastName: this.fb.nonNullable.control<string>(''),
      orderNumber: this.fb.nonNullable.control<string>(''),
    });

    // ACC-2 ve ACC-4: değer değişimlerini dinle
    const sub = this.form.valueChanges.subscribe(() => {
      this.enforceIdMutexRule();
      this.canSearch.set(this.anyFieldFilled());
    });
    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  private anyFieldFilled(): boolean {
    return Object.values(this.form.getRawValue()).some(v => (v ?? '').toString().trim().length > 0);
  }

  private enforceIdMutexRule(): void {
    const raw = this.form.getRawValue();
    // id alanlarından biri dolu mu?
    const anyIdFilled = this.idKeys.some(k => raw[k]?.trim().length);
    this.idKeys.forEach(k => {
      const ctrl = this.form.controls[k];
      if (anyIdFilled) {
        // Seçili olan dışındakileri kilitle
        const thisFilled = !!raw[k]?.trim().length;
        if (!thisFilled && !ctrl.disabled) ctrl.disable({ emitEvent: false });
        if (thisFilled && ctrl.disabled) ctrl.enable({ emitEvent: false }); // kendi kendine kilitlenmesin
      } else {
        // hepsi açık
        if (ctrl.disabled) ctrl.enable({ emitEvent: false });
      }
    });
  }

  clear(): void {
    this.form.reset({
      natId: '',
      customerId: '',
      accountNumber: '',
      gsmNumber: '',
      firstName: '',
      lastName: '',
      orderNumber: ''
    }, { emitEvent: true });
    this.cleared.emit();
  }

  // Kullanıcı hangi alanı girdiyse ona göre “keyword” hazırla
  // ACC-3 & ACC-9: ad/soyad girilirse içeren kayıtlar
  // ACC-2: id alanlarından biri girildiyse onu tek başına gönder
  buildQuery(): { field: string; value: string } | null {
   const v = this.form.getRawValue();
   // 1) Kimlik grubu öncelik
   for (const k of this.idKeys) {
     const val = (v[k] ?? '').trim();
     if (val) {
       const map: Record<string,string> = {
         natId: 'nationalId',
         customerId: 'customerNumber',
         accountNumber: 'accountNumber',
         gsmNumber: 'gsmNumber',
         orderNumber: 'orderNumber'
       };
       return { field: map[k], value: val };
     }
   }
   // 2) İsim/soyisim (contains için service karar veriyor)
   if ((v.firstName ?? '').trim()) return { field: 'firstName', value: v.firstName.trim() };
   if ((v.lastName ?? '').trim())  return { field: 'lastName',  value: v.lastName.trim()  };
   return null;
 }


  submit(): void {
  if (!this.canSearch()) return;
  const v = this.form.getRawValue();

  // ACC-2: id grubundan biri doluysa diğer dördü zaten disabled;
  // ama firstName/lastName ile birlikte gelebilir.
  const payload = {
    natId: v.natId?.trim() || undefined,
    customerId: v.customerId?.trim() || undefined,
    accountNumber: v.accountNumber?.trim() || undefined,
    gsmNumber: v.gsmNumber?.trim() || undefined,
    firstName: v.firstName?.trim() || undefined,
    lastName:  v.lastName?.trim()  || undefined,
    orderNumber: v.orderNumber?.trim() || undefined,
  };

  // hepsi boşsa gönderme
  if (Object.values(payload).every(x => !x)) return;

  this.searchClicked.emit(payload);
  }
}
