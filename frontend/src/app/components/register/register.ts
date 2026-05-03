import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {

  fullName: string = '';
  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  fullNameError: string = '';
  usernameError: string = '';
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';

  passwordStrength: number = 0;
  passwordStrengthLabel: string = '';
  passwordStrengthColor: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  validateFullName() {
    if (!this.fullName) {
      this.fullNameError = 'El nombre completo es obligatorio.';
    } else if (this.fullName.trim().split(' ').length < 2) {
      this.fullNameError = 'Ingresá nombre y apellido.';
    } else if (!/^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'-]+$/.test(this.fullName)) {
      this.fullNameError = ' Solo letras, sin números ni caracteres especiales.';
    }
  }

  validateUsername() {
    if (!this.username) {
      this.usernameError = 'El usuario es obligatorio.';
    } else if (this.username.length < 3) {
      this.usernameError = 'Mínimo 3 caracteres.';
    } else if (!/^[a-zA-Z0-9._-]+$/.test(this.username)) {
      this.usernameError = 'Solo letras, números, punto o guión. Sin espacios.';
    } else {
      this.usernameError = '';
    }
  }

  validateEmail() {
    if (!this.email) {
      this.emailError = 'El email es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      this.emailError = 'El formato del email no es válido.';
    } else {
      this.emailError = '';
    }
  }

  validatePassword() {
    if (!this.password) {
      this.passwordError = 'La contraseña es obligatoria.';
      this.passwordStrength = 0;
      this.passwordStrengthLabel = '';
      return;
    }

    if (this.password.length < 8) {
      this.passwordError = 'Mínimo 8 caracteres.';
      this.passwordStrength = 1;
      this.passwordStrengthLabel = 'Débil';
      this.passwordStrengthColor = '#dc2626';
      return;
    }

    this.passwordError = '';

    let strength = 0;
    if (this.password.length >= 8) strength++;
    if (/[A-Z]/.test(this.password)) strength++;
    if (/[0-9]/.test(this.password)) strength++;
    if (/[^a-zA-Z0-9]/.test(this.password)) strength++;

    if (strength <= 2) {
      this.passwordStrength = 1;
      this.passwordStrengthLabel = 'Débil';
      this.passwordStrengthColor = '#dc2626';
    } else if (strength === 3) {
      this.passwordStrength = 2;
      this.passwordStrengthLabel = 'Medio';
      this.passwordStrengthColor = '#f59e0b';
    } else {
      this.passwordStrength = 3;
      this.passwordStrengthLabel = 'Fuerte';
      this.passwordStrengthColor = '#16a34a';
    }

    if (this.confirmPassword) {
      this.validateConfirmPassword();
    }
  }

  validateConfirmPassword() {
    if (!this.confirmPassword) {
      this.confirmPasswordError = 'Confirmá tu contraseña.';
    } else if (this.password !== this.confirmPassword) {
      this.confirmPasswordError = 'Las contraseñas no coinciden.';
    } else {
      this.confirmPasswordError = '';
    }
  }

  get isFormValid(): boolean {
    return (
      this.fullName.trim().split(' ').length >= 2 &&
      !this.fullNameError &&
      this.username.length >= 3 &&
      !this.usernameError &&
      this.email.includes('@') &&
      !this.emailError &&
      this.password.length >= 8 &&
      this.passwordStrength >= 2 &&
      this.password === this.confirmPassword &&
      !this.confirmPasswordError
    );
  }

  onRegister(event: any) {
    event.preventDefault();

    this.validateFullName();
    this.validateUsername();
    this.validateEmail();
    this.validatePassword();
    this.validateConfirmPassword();

    if (!this.isFormValid) {
      this.errorMessage = 'Corregí los errores antes de continuar.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.register({
      username: this.username,
      email: this.email,
      password: this.password,
      full_name: this.fullName
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = '¡Cuenta creada! Redirigiendo al login...';
        setTimeout(() => this.router.navigate(['/login']), 2500);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.error?.username) {
          this.usernameError = 'Ese nombre de usuario ya está en uso.';
        } else if (err.error?.email) {
          this.emailError = 'Ese email ya está registrado.';
        } else if (err.error?.password) {
          this.passwordError = err.error.password[0];
        } else {
          this.errorMessage = 'No se pudo crear la cuenta. Intentá de nuevo.';
        }
      }
    });
  }
}