import { Component, inject, input, output } from '@angular/core';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  currentUser = input<string>('JOHN');
  
  // constructor(private authService: AuthService) {}
  //aynı işlevi gören modern inject kullanımı
  private authService = inject(AuthService);
  
  onLogout() {
    this.authService.logout();
  }
}
