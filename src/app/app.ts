import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from "./components/CoreComponents/sidebar/sidebar";
import { Header } from "./components/CoreComponents/header/header";
import { AuthService } from './services/auth-service';
import { CommonModule } from '@angular/common';



@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, Sidebar, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  
  

  protected readonly title = signal('TelcoCrmAngular');
  protected readonly currentUser = signal('JOHN');
  protected readonly sidebarOpen = signal(true);

  authService = inject(AuthService);
  isLoggedIn = this.authService.isLoggedIn;

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }
}
