import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { WebAuthnService } from '../../Services/webauthn.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent implements OnInit {
  name            = '';
  email           = '';
  password        = '';
  confirmPassword = '';
  errorMsg        = '';
  loading         = false;

  biometricSupported  = false;
  biometricLoading    = false;
  registrationDone    = false;
  biometricRegistered = false;
  biometricErrorMsg   = '';

  constructor(
    private authService: AuthService,
    private webAuthn:    WebAuthnService,
    private router:      Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.biometricSupported = await this.webAuthn.isSupported();
  }

  onSubmit(): void {
    this.errorMsg = '';
    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMsg = 'Por favor completa todos los campos.';
      return;
    }
    if (this.password.length < 6) {
      this.errorMsg = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }
    this.loading = true;
    this.authService.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        if (this.biometricSupported) {
          this.registrationDone = true;
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.loading = false;
        this.errorMsg = err?.error?.message ?? 'Ya existe una cuenta con ese correo.';
      }
    });
  }

  async onRegisterBiometric(): Promise<void> {
    this.biometricErrorMsg = '';
    this.biometricLoading  = true;
    try {
      await this.webAuthn.register(this.email, this.name);
      this.biometricRegistered = true;
      setTimeout(() => this.router.navigate(['/']), 1500);
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        this.biometricErrorMsg = 'Registro cancelado. Puedes activarlo más tarde.';
      } else {
        this.biometricErrorMsg = 'No se pudo registrar la huella. Inténtalo de nuevo.';
      }
    } finally {
      this.biometricLoading = false;
    }
  }

  skipBiometric(): void { this.router.navigate(['/']); }
}
