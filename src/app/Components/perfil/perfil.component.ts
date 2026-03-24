import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService, UserProfile } from '../../Services/auth.service';
import { DireccionUsuario } from '../../models/product.model';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  profile: UserProfile | null = null;
  isLoading = true;

  // Editar perfil
  editName  = '';
  editEmail = '';
  profileMsg  = '';
  profileError = '';
  savingProfile = false;

  // Cambiar contraseña
  currentPassword = '';
  newPassword     = '';
  confirmNewPwd   = '';
  passwordMsg     = '';
  passwordError   = '';
  savingPassword  = false;

  // Dirección
  direccion: DireccionUsuario = {
    calle: '', numero_ext: '', colonia: '', ciudad: '', estado: '', codigo_postal: '', pais: 'México'
  };
  addressMsg   = '';
  addressError = '';
  savingAddress = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.getMe().subscribe({
      next: (profile) => {
        this.profile   = profile;
        this.editName  = profile.name;
        this.editEmail = profile.email;
        this.isLoading = false;
      },
      error: () => { this.isLoading = false; }
    });

    this.authService.getDireccion().subscribe({
      next: (dir: any) => { if (dir) this.direccion = dir; },
      error: () => {}
    });
  }

  saveProfile(): void {
    this.profileMsg = '';
    this.profileError = '';
    this.savingProfile = true;
    this.authService.updateMe({ name: this.editName, email: this.editEmail }).subscribe({
      next: (updated) => {
        this.profile!.name  = updated.name;
        this.profile!.email = updated.email;
        this.profileMsg     = 'Perfil actualizado correctamente.';
        this.savingProfile  = false;
      },
      error: () => {
        this.profileError  = 'Error al actualizar perfil.';
        this.savingProfile = false;
      }
    });
  }

  savePassword(): void {
    this.passwordMsg = '';
    this.passwordError = '';
    if (this.newPassword !== this.confirmNewPwd) {
      this.passwordError = 'Las contraseñas no coinciden.';
      return;
    }
    if (this.newPassword.length < 6) {
      this.passwordError = 'La nueva contraseña debe tener al menos 6 caracteres.';
      return;
    }
    this.savingPassword = true;
    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.passwordMsg    = 'Contraseña actualizada.';
        this.currentPassword = '';
        this.newPassword     = '';
        this.confirmNewPwd   = '';
        this.savingPassword  = false;
      },
      error: () => {
        this.passwordError  = 'Contraseña actual incorrecta.';
        this.savingPassword = false;
      }
    });
  }

  saveAddress(): void {
    this.addressMsg = '';
    this.addressError = '';
    this.savingAddress = true;
    this.authService.saveDireccion(this.direccion).subscribe({
      next: () => {
        this.addressMsg   = 'Dirección guardada.';
        this.savingAddress = false;
      },
      error: () => {
        this.addressError  = 'Error al guardar dirección.';
        this.savingAddress = false;
      }
    });
  }
}
