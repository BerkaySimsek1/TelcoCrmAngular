import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth-service'; // AuthService'imizi import ediyoruz

// Bu, Angular'ın yeni fonksiyonel Interceptor yapısıdır
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>, // Yakalanan giden istek
  next: HttpHandlerFn       // İsteği devam ettirecek olan fonksiyon
): Observable<HttpEvent<unknown>> => {

  // AuthService'i inject ediyoruz
  const authService = inject(AuthService);
  // localStorage'dan token'ı alıyoruz
  const token = authService.getToken();

  // Eğer token varsa VE istek login/register sayfasına gitmiyorsa
  // (Login isteğine token eklemeye gerek yok)
  if (token && !req.url.includes('/authservice/api/auth')) {

    // İsteği klonluyoruz ve header'ına Authorization ekliyoruz
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });

    // Header'ı eklenmiş YENİ isteği (clonedReq) devam ettiriyoruz
    return next(clonedReq);
  }
  // Eğer token yoksa veya bu bir loginisteğiyse,
  // isteği klonlamadan, olduğu gibi devam ettiriyoruz
  // console.log('Interceptor: Token eklenmedi', req.url); 
  return next(req);
};