import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from "../services/auth-service";


// AuthGuard: Belirli rotalara erişimi kontrol eden koruma mekanizması
// Kullanıcının giriş yapıp yapmadığını (isLoggedIn) kontrol eder
// Eğer giriş yapmışsa erişime izin verir, yapmamışsa login sayfasına yönlendirir
// (adress barına manuel URL girilse bile koruma sağlar!!!)

// Bu, Angular'ın yeni fonksiyonel guard yapısıdır (CanActivateFn)
export const authGuard: CanActivateFn = (route, state) => {
  // Gerekli servisleri inject fonksiyonu ile aldık

  // constructor(private authService: AuthService, private router: Router) {}
  //aynı işlevi gören modern inject kullanımı
  const authService = inject(AuthService);
  const router = inject(Router);

  // AuthService'deki isLoggedIn signal'ini kontrol ediyoruz
  if (authService.isLoggedIn()) {
    // Eğer kullanıcı giriş yapmışsa (isLoggedIn true ise)
    return true; // Bu route'a (sayfaya) erişime izin ver
  } else {
    // Eğer kullanıcı giriş yapmamışsa (isLoggedIn false ise)
    console.warn('AuthGuard: Access denied - User not logged in. Redirecting to /login');
    // Kullanıcıyı login sayfasına yönlendiriyoruz
    router.navigate(['/login']);
    // Bu route'a (sayfaya) erişimi engelle
    return false;
  }
};