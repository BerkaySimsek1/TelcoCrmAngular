import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-sidebar',
  imports: [],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar {
  isOpen = input<boolean>(true);
  
  toggle = output<void>();

  onToggle() {
    this.toggle.emit();
  }
}
