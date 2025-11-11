import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest } from '../models/AuthModels/loginRequest';
import { LoginResponse } from '../models/AuthModels/loginResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // API Gateway üzerinden authservice'e yönlendirme
  private readonly authUrl = 'http://localhost:8091/authservice/api/auth';
  private readonly TOKEN_KEY = 'jwtToken'; // localStorage için key

  // Kullanıcının login olup olmadığını tutacak signal
  isLoggedIn = signal<boolean>(this.hasToken());
  
  // Kullanıcı adını tutacak signal
  currentUserName = signal<string>('');

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, credentials)
      .pipe(
        tap(response => {
          // Gelen token'ı localStorage'a kaydet
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this.isLoggedIn.set(true); // Login durumunu güncelle
          // Token'dan kullanıcı bilgisini çıkar ve set et
          this.setUserFromToken(response.token);
          console.log('Login successful, token stored.');
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY); // Token'ı sil
    this.isLoggedIn.set(false); // Login durumunu güncelle
    this.currentUserName.set(''); // Kullanıcı adını temizle
    console.log('Logged out, token removed.');
    this.router.navigate(['/login']); // Login sayfasına yönlendir
  }

  //  Bu metot, tarayıcının yerel depolama alanından 
  // (localStorage) daha önce kaydedilmiş olan JWT token'ını okumaya yarar.
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  //Bu metot, basitçe tarayıcının yerel depolama alanında 
  // (localStorage) bir token'ın var olup olmadığını kontrol eder.
  private hasToken(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  // Token'dan kullanıcı adını çıkar ve signal'e ata
  private setUserFromToken(token: string): void {
    const decoded = this.decodeToken(token);
    if (decoded) {
      // Token'da sub alanı kullanıcı adı içeriyor
      const userName = decoded.sub || decoded.name || decoded.username || 'User';
      // İlk harfi büyük yap
      const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);
      this.currentUserName.set(displayName);
      console.log('Kullanıcı adı ayarlandı:', displayName);
    }
  }

  // JWT token'ı decode eden fonksiyon
  private decodeToken(token: string): any {
    try {
      // Token'ı . ile böl (header.payload.signature)
      const parts = token.split('.');
      if (parts.length !== 3) {
        console.error('Geçersiz token formatı');
        return null;
      }

      // Payload'ı (ortadaki kısım) al
      const payload = parts[1];
      
      // Base64 decode et
      const decoded = atob(payload);
      
      // JSON'a çevir
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Token decode hatası:', error);
      return null;
    }
  }

  // Sayfa yenilendiğinde token'dan kullanıcı bilgisini yükle
  loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      this.setUserFromToken(token);
    }
  }
}