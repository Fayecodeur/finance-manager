import { Component, Inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface DangerConfirmDialogData {
  title: string;
  message: string;
  confirmWord: string;
}

@Component({
  selector: 'app-danger-confirm-dialog',
  imports: [
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './danger-confirm-dialog.html',
  styleUrl: './danger-confirm-dialog.scss',
})
export class DangerConfirmDialog {
  inputValue = signal('');

  constructor(
    private dialogRef: MatDialogRef<DangerConfirmDialog>,
    @Inject(MAT_DIALOG_DATA) public data: DangerConfirmDialogData,
  ) {}

  get isValid(): boolean {
    return this.inputValue().trim().toUpperCase() === this.data.confirmWord.toUpperCase();
  }

  onConfirm(): void {
    if (this.isValid) {
      this.dialogRef.close(true);
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
