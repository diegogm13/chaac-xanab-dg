import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMsg = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

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
}
