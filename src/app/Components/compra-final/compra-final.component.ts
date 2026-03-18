import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../Services/auth.service';

@Component({
  selector: 'app-compra-final',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './compra-final.component.html',
  styleUrl: './compra-final.component.css'
})
export class CompraFinalComponent implements OnInit {
  orderNumber = '';
  userName = '';
  orderDate = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.userName = user?.name || 'Cliente';

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const rand = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `#CX-${dateStr}-${rand}`;

    this.orderDate = now.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
