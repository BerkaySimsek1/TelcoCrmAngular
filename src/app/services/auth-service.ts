import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { LoginRequest } from '../models/loginRequest';
import { LoginResponse } from '../models/loginResponse';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // API Gateway üzerinden authservice'e yönlendirme
  private readonly authUrl = 'http://localhost:8091/authservice/api/auth';
  private readonly TOKEN_KEY = 'jwtToken'; // localStorage için key

  // Kullanıcının login olup olmadığını tutacak signal
  isLoggedIn = signal<boolean>(this.hasToken());

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.authUrl}/login`, credentials)
      .pipe(
        tap(response => {
          // Gelen token'ı localStorage'a kaydet
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this.isLoggedIn.set(true); // Login durumunu güncelle
          console.log('Login successful, token stored.');
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY); // Token'ı sil
    this.isLoggedIn.set(false); // Login durumunu güncelle
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
}