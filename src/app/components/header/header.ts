import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  currentUser = input<string>('JOHN');
  
  logout = output<void>();

  onLogout() {
    this.logout.emit();
  }
}
