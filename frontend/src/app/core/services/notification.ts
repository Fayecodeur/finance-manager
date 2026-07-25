import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private snackBar: MatSnackBar) {}

  success(message: string, duration = 3000): void {
    this.snackBar.open(message, '', {
      duration,
      panelClass: ['app-toast-success'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }

  error(message: string, duration = 4000): void {
    this.snackBar.open(message, '', {
      duration,
      panelClass: ['app-toast-error'],
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
