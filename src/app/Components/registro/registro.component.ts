import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.component.html',
  styleUrl: './registro.component.css'
})
export class RegistroComponent {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMsg = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

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
        this.router.navigate(['/']);
      } else {
        this.errorMsg = 'Ya existe una cuenta con ese correo.';
      }
    }, 400);
  }
}
