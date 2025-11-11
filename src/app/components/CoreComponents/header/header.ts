// header.component.ts
import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth-service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  private authService = inject(AuthService);
  
  // AuthService'ten gelen kullanıcı adı signal'i
  currentUser = this.authService.currentUserName;

  ngOnInit(): void {
    // Header yüklendiğinde token'dan kullanıcı adını yükle
    this.authService.loadUserFromToken();
  }

  onLogout() {
    this.authService.logout();
  }
}