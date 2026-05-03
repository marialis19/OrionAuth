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

  username: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

  isLoading: boolean = false;
  errorMessage: string = '';
  successMessage: string = '';

  // ESTADOS DE VALIDACIÓN  
  usernameError: string = '';
  emailError: string = '';
  passwordError: string = '';
  confirmPasswordError: string = '';

  // FUERZA DE CONTRASEÑA 
  passwordStrength: number = 0;
  // 0 = vacía | 1 = débil | 2 = media | 3 = fuerte
  passwordStrengthLabel: string = '';
  passwordStrengthColor: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // VALIDACIONES EN TIEMPO REAL
  validateUsername() {
        if (!this.username) {
      this.usernameError = 'El usuario es obligatorio.';
    } else if (this.username.length < 3) {
      this.usernameError = 'Mínimo 3 caracteres.';
    } else if (!/^[a-zA-Z0-9_]+$/.test(this.username)) {
      this.usernameError = 'Solo letras, números y guión bajo.';
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

    // CALCULAR FORTALEZA 
    let strength = 0;

    if (this.password.length >= 8) strength++;
  
    if (/[A-Z]/.test(this.password) && /[a-z]/.test(this.password)) strength++;
    
    if (/[0-9]/.test(this.password)) strength++;

    if (/[^a-zA-Z0-9]/.test(this.password)) strength++;
    
    // Mapeamos el puntaje a nivel de fortaleza
    if (strength <= 1) {
      this.passwordStrength = 1;
      this.passwordStrengthLabel = 'Débil';
      this.passwordStrengthColor = '#dc2626';
      this.passwordError = 'La contraseña es muy débil.';
    } else if (strength === 2) {
      this.passwordStrength = 2;
      this.passwordStrengthLabel = 'Media';
      this.passwordStrengthColor = '#f59e0b';
      this.passwordError = '';
    } else {
      this.passwordStrength = 3;
      this.passwordStrengthLabel = 'Fuerte';
      this.passwordStrengthColor = '#16a34a';
      this.passwordError = '';
    }

    if (this.password.length < 8) {
      this.passwordError = 'Mínimo 8 caracteres.';
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

  // ¿EL FORMULARIO ES VÁLIDO? 
  get isFormValid(): boolean {
    return (
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
      password: this.password
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = '¡Cuenta creada! Redirigiendo al login...';
        setTimeout(() => this.router.navigate(['/login']), 2000);
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