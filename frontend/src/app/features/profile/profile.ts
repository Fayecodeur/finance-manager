import { Component, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserService } from '../../core/services/user';
import { TransactionService } from '../../core/services/transaction';
import { NotificationService } from '../../core/services/notification';
import { MatDividerModule } from '@angular/material/divider';
import { LoadingSpinner } from '../../shared/loading-spinner/loading-spinner';
import { DangerConfirmDialog } from '../../shared/danger-confirm-dialog/danger-confirm-dialog';

@Component({
  selector: 'app-profile',
  imports: [
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatDialogModule,
    LoadingSpinner,
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile implements OnInit {
  infoForm: FormGroup;
  passwordForm: FormGroup;
  hideCurrentPassword = true;
  hideNewPassword = true;
  isLoading = signal(true);

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private transactionService: TransactionService,
    private notification: NotificationService,
    private dialog: MatDialog,
  ) {
    this.infoForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.userService.getProfile().subscribe({
      next: (user) => {
        this.infoForm.patchValue({ name: user.name, email: user.email });
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  onSubmitInfo(): void {
    if (this.infoForm.invalid) {
      this.infoForm.markAllAsTouched();
      return;
    }

    this.userService.updateProfile(this.infoForm.value).subscribe({
      next: () => this.notification.success('Profil mis à jour avec succès'),
      error: (err) =>
        this.notification.error(err.error?.message || 'Erreur lors de la mise à jour'),
    });
  }

  onSubmitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.value;

    this.userService.changePassword(currentPassword, newPassword).subscribe({
      next: () => {
        this.notification.success('Mot de passe modifié avec succès');
        this.passwordForm.reset();
      },
      error: (err) =>
        this.notification.error(err.error?.message || 'Erreur lors du changement de mot de passe'),
    });
  }

  onResetTransactions(): void {
    const dialogRef = this.dialog.open(DangerConfirmDialog, {
      width: '400px',
      data: {
        title: 'Supprimer toutes les transactions',
        message:
          'Cette action supprimera définitivement toutes vos transactions. Cette action est irréversible et ne peut pas être annulée.',
        confirmWord: 'SUPPRIMER',
      },
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.transactionService.resetAllTransactions().subscribe({
        next: (res) => {
          this.notification.success(`${res.count} transaction(s) supprimée(s)`);
        },
        error: () => this.notification.error('Erreur lors de la suppression'),
      });
    });
  }
}
