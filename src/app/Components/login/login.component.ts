import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth.service';
import { WebAuthnService } from '../../Services/webauthn.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  email    = '';
  password = '';
  errorMsg = '';
  loading  = false;
  emailNotVerified = false;
  resendLoading    = false;
  resendMsg        = '';

  biometricSupported = false;
  biometricLoading   = false;

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
    this.emailNotVerified = false;
    this.resendMsg = '';
    if (!this.email || !this.password) {
      this.errorMsg = 'Por favor completa todos los campos.';
      return;
    }
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate([this.authService.isAdmin() ? '/admin' : '/']);
      },
      error: (err) => {
        this.loading = false;
        if (err?.error?.message === 'EMAIL_NOT_VERIFIED') {
          this.emailNotVerified = true;
          this.errorMsg = 'Debes verificar tu correo antes de iniciar sesión.';
        } else {
          this.errorMsg = 'Correo o contraseña incorrectos.';
        }
      }
    });
  }

  resendVerification(): void {
    this.resendLoading = true;
    this.resendMsg = '';
    this.authService.resendVerification(this.email).subscribe({
      next: (res) => {
        this.resendLoading = false;
        this.resendMsg = res.message;
      },
      error: () => {
        this.resendLoading = false;
        this.resendMsg = 'Error al reenviar. Inténtalo de nuevo.';
      }
    });
  }

  async onBiometricLogin(): Promise<void> {
    this.errorMsg = '';
    if (!this.email) {
      this.errorMsg = 'Escribe tu correo y luego usa la huella.';
      return;
    }
    this.biometricLoading = true;
    try {
      const verified = await this.webAuthn.login(this.email);
      if (verified) {
        this.router.navigate([this.authService.isAdmin() ? '/admin' : '/']);
      } else {
        this.errorMsg = 'No se pudo verificar la huella. Intenta de nuevo.';
      }
    } catch (err: any) {
      if (err?.name === 'NotAllowedError') {
        this.errorMsg = 'Verificación cancelada o huella no reconocida.';
      } else if (err?.name === 'SecurityError') {
        this.errorMsg = 'Error de seguridad. Verifica que el sitio corra en localhost o HTTPS.';
      } else {
        this.errorMsg = '¿Tienes huella registrada? Regístrate y activa la biometría.';
      }
    } finally {
      this.biometricLoading = false;
    }
  }
}
