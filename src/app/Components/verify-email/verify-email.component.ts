import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css'
})
export class VerifyEmailComponent implements OnInit {
  state: 'loading' | 'success' | 'error' = 'loading';
  message = '';

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token_hash');
    if (!token) {
      this.state   = 'error';
      this.message = 'Enlace inválido. No se encontró el token de verificación.';
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: (res) => {
        this.state   = 'success';
        this.message = res.message;
      },
      error: (err) => {
        this.state   = 'error';
        this.message = err?.error?.message ?? 'No se pudo verificar el correo.';
      }
    });
  }
}
