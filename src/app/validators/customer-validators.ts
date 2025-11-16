import { AbstractControl, AsyncValidatorFn, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Observable, of, timer } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { CustomerService } from '../services/customer-service';

/**
 * Yalnızca harf (Türkçe harfler dahil), boşluk, tek tırnak ve tire kabul eder.
 * min–max uzunluk kontrolü içerir.
 */
export function lettersOnlyValidator(min = 2, max = 50): ValidatorFn {
  // Türkçe karakter seti + boşluk + ' -
  const re = new RegExp(`^[A-Za-zÇĞİÖŞÜçğıöşü'\\-\\s]{${min},${max}}$`);
  return (control: AbstractControl): ValidationErrors | null => {
    const v = (control.value ?? '').trim();
    if (!v) return null; // zorunluluk başka validator’dan gelir
    return re.test(v) ? null : { lettersOnly: true };
  };
}

/**
 * Gelecek tarih olamaz (input type="date" => YYYY-MM-DD)
 */
export function notFutureDateValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v: string = control.value;
    if (!v) return null;
    const input = new Date(v + 'T00:00:00');
    const today = new Date();
    // Sadece tarihe bak (saat farklarını normalize et)
    input.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return input.getTime() <= today.getTime() ? null : { futureDate: true };
  };
}

/**
 * Minimum yaş kontrolü (örn: 18).
 * input type="date" => YYYY-MM-DD
 */
export function minAgeValidator(minAge: number): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v: string = control.value;
    if (!v) return null;

    const birthDate = new Date(v + 'T00:00:00');
    const today = new Date();

    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age >= minAge ? null : { underAge: true };
  };
}


/**
 * TCKN kuralları:
 * - 11 hane, sadece rakam
 * - 0 ile başlayamaz
 * - Son hanesi çift olmalı
 */
export function nationalIdRulesValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v: string = control.value ?? '';
    if (!v) return null; // zorunlu başka validator’dan gelecek
    if (!/^\d{11}$/.test(v)) return { nationalIdFormat: true };
    if (v.startsWith('0')) return { nationalIdStartsWithZero: true };
    const lastDigit = parseInt(v[v.length - 1], 10);
    if (lastDigit % 2 !== 0) return { nationalIdNotEven: true };
    return null;
  };
}

/**
 * TCKN benzersizlik kontrolü (FR4 için async). 
 * Service tarafında /existsByNationalId gibi bir uç bekler.
 * 400ms debounce ile gereksiz çağrılar azaltılır.
 */
export function nationalIdUniqueAsyncValidator(customerService: CustomerService): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const v: string = control.value ?? '';
    if (!v || control.pristine) return of(null);
    // Senkron kurallar hatalıysa server’a gitmeye gerek yok
    if (nationalIdRulesValidator()(control)) return of(null);

    return timer(400).pipe(
      switchMap(() => customerService.existsByNationalId(v)),
      map((exists) => (exists ? { nationalIdTaken: true } : null)),
      catchError(() => of(null)) // hata durumunda validasyonu engelleme
    );
  };
}

// EKLE: Update ekranı için "kendisini hariç tut" benzersizlik kontrolü
export function nationalIdUniqueForUpdateAsyncValidator(
  customerService: CustomerService,
  originalNationalIdGetter: () => string | null
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors | null> => {
    const v: string = control.value ?? '';
    if (!v || control.pristine) return of(null);

    // Senkron kurallar hatalı ise server'a gitme
    if (nationalIdRulesValidator()(control)) return of(null);

    // Orijinal ile aynıysa "değişiklik yok" → geçerli
    const original = (originalNationalIdGetter() || '').trim();
    if (original && v.trim() === original) return of(null);

    // Farklıysa: mevcut uç ile sor
    return timer(400).pipe(
      switchMap(() => customerService.existsByNationalId(v)),
      map((exists) => (exists ? { nationalIdTaken: true } : null)),
      catchError(() => of(null))
    );
  };
}

