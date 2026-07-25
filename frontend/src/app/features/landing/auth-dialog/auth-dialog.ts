import { Component, Inject, ChangeDetectorRef } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { Auth } from '../../../core/services/auth';
import { NotificationService } from '../../../core/services/notification';

@Component({
  selector: 'app-auth-dialog',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './auth-dialog.html',
  styleUrl: './auth-dialog.scss',
})
export class AuthDialog {
  mode: 'login' | 'register';
  loginForm: FormGroup;
  registerForm: FormGroup;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: Auth,
    private notification: NotificationService,
    private router: Router,
    private dialogRef: MatDialogRef<AuthDialog>,
    private cdr: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'login' | 'register' },
  ) {
    this.mode = data.mode;

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  switchMode(mode: 'login' | 'register'): void {
    this.mode = mode;
    this.errorMessage = '';
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { email, password } = this.loginForm.value;
    this.authService.login(email, password).subscribe({
      next: () => {
        this.dialogRef.close();
        this.router.navigate(['/app/dashboard']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Erreur de connexion';
        this.cdr.detectChanges();
      },
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const { name, email, password } = this.registerForm.value;

    this.authService.register(name, email, password).subscribe({
      next: () => {
        this.notification.success('Compte créé avec succès, connectez-vous');
        this.switchMode('login');
        this.loginForm.patchValue({ email });
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = err.error?.message || "Erreur lors de l'inscription";
        this.cdr.detectChanges();
      },
    });
  }
}
