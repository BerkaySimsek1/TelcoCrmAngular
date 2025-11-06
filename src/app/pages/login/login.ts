import { CommonModule } from '@angular/common';
import { Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService} from '../../services/auth-service';
import { LoginRequest } from '../../models/AuthModels/loginRequest';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {

  loginForm!: FormGroup;
  submitting = signal(false);
  errorMessage = signal<string | null>(null);
  passwordVisible = signal(false); // ACC-4: Şifre görünürlüğü için signal
  

  // ACC-2: Butonun aktif olup olmayacağını hesaplayan computed signal
  isLoginButtonEnabled = signal(false);

  // Dependency Injection (DI) için modern inject fonksiyonu kullanımı
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      // ACC-1: Username ve şifre alanları (Email backend'de username yerine geçiyor)
      email: ['', Validators.required],
      // 'password' kontrolü: başlangıç değeri boş, zorunlu (required)
      password: ['', Validators.required] // ACC-1, ACC-3 (HTML'de type="password" olacak)
    });

    // --- DEĞİŞİKLİK BURADA ---
    // Formun değer değişikliklerini dinle
    this.loginForm.valueChanges
      .pipe(
        // Component yok edildiğinde otomatik olarak subscription'ı kaldırır
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => {
        // Değişiklik olduğunda buton durumunu yeniden hesapla ve signal'i güncelle
        const email = this.loginForm.get('email')?.value || '';
        const password = this.loginForm.get('password')?.value || '';
        this.isLoginButtonEnabled.set(email.length >= 2 && password.length >= 2);
        // console.log(`Button Enabled: ${this.isLoginButtonEnabled()}`); // Kontrol için log
      });
    // --- DEĞİŞİKLİK SONU ---
  }

  
  // Template (HTML) içinde form kontrollerine 
  // daha kolay erişim sağlamak için bir getter
  get f() { return this.loginForm.controls; }

  // ACC-4: Şifre görünürlüğünü değiştiren fonksiyon
  togglePasswordVisibility(): void {
    this.passwordVisible.update(visible => !visible);
  }

  // Form submit edildiğinde (Login butonuna tıklandığında) çalışacak metot
  onSubmit(): void {
    // ACC-2: Buton aktif değilse veya zaten istek atılıyorsa bir şey yapma
    if (!this.isLoginButtonEnabled() || this.submitting()) {
       this.loginForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true); // Login isteği başladığını belirt (buton disable olacak, spinner görünecek)
    this.errorMessage.set(null); // Varsa önceki hata mesajını temizle

    // Formdaki email ve şifre değerlerini 
    // alıp LoginRequest tipine uygun bir obje oluştur
    const credentials: LoginRequest = this.loginForm.value;

    // AuthService üzerinden backend'e login isteği gönder
    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.submitting.set(false);
        console.log('Login successful, response:', response);
        // ACC-6: Başarılı login sonrası customer search ekranına yönlendir
        this.router.navigate(['/search-list']);
      },
      error: (err) => {
        this.submitting.set(false);
        console.error('Login failed:', err);
        // ACC-5: Belirtilen hata mesajını göster
        this.errorMessage.set('Wrong username or password. Please try again');
      }
    });
  }

}
