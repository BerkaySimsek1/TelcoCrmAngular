import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ModalType = 'confirm' | 'error';

@Component({
  selector: 'app-delete-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delete-confirmation-modal.html',
  styleUrl: './delete-confirmation-modal.scss',
})
export class DeleteConfirmationModalComponent {
  @Input() isOpen = false;
  @Input() modalType: ModalType = 'confirm';
  @Input() title = 'Are you sure?';
  @Input() message = 'This action cannot be undone.';
  @Input() isLoading = false;

  @Output() onConfirm = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();
  @Output() onClose = new EventEmitter<void>();

  confirm(): void {
    if (!this.isLoading) {
      this.onConfirm.emit();
    }
  }

  cancel(): void {
    this.onCancel.emit();
  }

  close(): void {
    this.onClose.emit();
  }

  getConfirmButtonText(): string {
    return this.modalType === 'confirm' ? 'YES' : 'OK';
  }

  shouldShowCancelButton(): boolean {
    return this.modalType === 'confirm';
  }
}