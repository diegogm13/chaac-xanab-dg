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

  // ── Biometría (aparece DESPUÉS de crear la cuenta) ─────────────────────────
  biometricSupported     = false;
  biometricLoading       = false;
  registrationDone       = false; // true tras registro exitoso → mostrar opción de huella
  biometricRegistered    = false; // true tras activar la huella
  biometricErrorMsg      = '';

  constructor(
    private authService: AuthService,
    private webAuthn:    WebAuthnService,
    private router:      Router,
  ) {}

  async ngOnInit(): Promise<void> {
    this.biometricSupported = await this.webAuthn.isSupported();
  }

  // ── Registro tradicional ───────────────────────────────────────────────────
  onSubmit(): void {
    this.errorMsg = '';

    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMsg = 'Por favor completa todos los campos.';
      return;
    }
    if (this.password.length < 4) {
      this.errorMsg = 'La contraseña debe tener al menos 4 caracteres.';
      return;
    }
    if (this.password !== this.confirmPassword) {
      this.errorMsg = 'Las contraseñas no coinciden.';
      return;
    }

    this.loading = true;
    setTimeout(() => {
      const success = this.authService.register(this.name, this.email, this.password);
      this.loading = false;
      if (success) {
        if (this.biometricSupported) {
          // Cuenta creada: mostrar opción de activar huella antes de ir al inicio
          this.registrationDone = true;
        } else {
          this.router.navigate(['/']);
        }
      } else {
        this.errorMsg = 'Ya existe una cuenta con ese correo.';
      }
    }, 400);
  }

  // ── Activar huella digital (opcional, después del registro) ────────────────
  async onRegisterBiometric(): Promise<void> {
    this.biometricErrorMsg = '';
    this.biometricLoading  = true;
    try {
      // El TPM del dispositivo genera el par de llaves y solicita la huella
      await this.webAuthn.register(this.email, this.name);
      this.biometricRegistered = true;
      // Ir al inicio tras 1.5 s para que el usuario vea el mensaje de éxito
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

  // ── Saltar activación de huella ────────────────────────────────────────────
  skipBiometric(): void {
    this.router.navigate(['/']);
  }
}
