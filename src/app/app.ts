import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from "./components/sidebar/sidebar";
import { Header } from "./components/header/header";


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Sidebar, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('TelcoCrmAngular');
  protected readonly currentUser = signal('JOHN');
  protected readonly sidebarOpen = signal(true);

  toggleSidebar() {
    this.sidebarOpen.update(v => !v);
  }

  handleLogout() {
    console.log('Logout clicked');
    // Logout logic here
  }
}
