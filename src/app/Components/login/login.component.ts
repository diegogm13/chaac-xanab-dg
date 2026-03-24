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

  // ── Biometría ──────────────────────────────────────────────────────────────
  biometricSupported = false; // true si el dispositivo tiene Windows Hello / Touch ID
  biometricLoading   = false;

  constructor(
    private authService:   AuthService,
    private webAuthn:      WebAuthnService,
    private router:        Router,
  ) {}

  async ngOnInit(): Promise<void> {
    // Comprobar soporte ANTES de mostrar el botón de huella
    this.biometricSupported = await this.webAuthn.isSupported();
  }

  // ── Login tradicional (email + contraseña) ─────────────────────────────────
  onSubmit(): void {
    this.errorMsg = '';
    if (!this.email || !this.password) {
      this.errorMsg = 'Por favor completa todos los campos.';
      return;
    }
    this.loading = true;
    setTimeout(() => {
      const success = this.authService.login(this.email, this.password);
      this.loading = false;
      if (success) {
        this.router.navigate(['/carrito']);
      } else {
        this.errorMsg = 'Correo o contraseña incorrectos.';
      }
    }, 400);
  }

  // ── Login biométrico (huella digital) ──────────────────────────────────────
  async onBiometricLogin(): Promise<void> {
    this.errorMsg = '';

    // El usuario debe escribir su email para que el servidor pueda buscar
    // el credentialId asociado a su cuenta.
    if (!this.email) {
      this.errorMsg = 'Escribe tu correo y luego usa la huella.';
      return;
    }

    this.biometricLoading = true;
    try {
      // Llama al autenticador de plataforma (Windows Hello / Touch ID)
      const verified = await this.webAuthn.login(this.email);

      if (verified) {
        // El servidor confirmó la firma → abrir sesión localmente
        const sessionOk = this.authService.loginBiometric(this.email);
        if (sessionOk) {
          this.router.navigate(['/carrito']);
          return;
        }
        // El email no existe como usuario registrado
        this.errorMsg = 'No existe una cuenta con ese correo.';
      } else {
        this.errorMsg = 'No se pudo verificar la huella. Intenta de nuevo.';
      }
    } catch (err: any) {
      // NotAllowedError: el usuario canceló o la huella no coincidió
      if (err?.name === 'NotAllowedError') {
        this.errorMsg = 'Verificación cancelada o huella no reconocida.';
      } else if (err?.name === 'SecurityError') {
        this.errorMsg = 'Error de seguridad. Verifica que el sitio corra en localhost o HTTPS.';
      } else {
        // HTTP 404 del servidor: sin huella registrada
        this.errorMsg = '¿Tienes huella registrada? Regístrate y activa la biometría.';
      }
    } finally {
      this.biometricLoading = false;
    }
  }
}
