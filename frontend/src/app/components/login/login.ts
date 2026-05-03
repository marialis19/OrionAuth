import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  // VIEWS
  currentView: 'login' | 'forgot' | 'verify' | 'reset' = 'login'; // Variable para controlar qué formulario mostrar

  isLoading: boolean = false; 
  errorMessage: string = ''; 
  successMessage: string = ''; 

  username: string = '';
  password: string = '';

  email: string = '';

  otp: string = '';

  newPassword: string = '';
  confirmPassword: string = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // NAVEGACIÓN ENTRE VISTAS
  setView(view: 'login' | 'forgot' | 'verify' | 'reset') {
    this.currentView = view; 
    this.errorMessage = ''; 
    this.successMessage = ''; 
  }

  // PANTALLA 1 : LOGIN
  onLogin(event: any) {
    event.preventDefault();

    if (!this.username || !this.password) { 
      this.errorMessage = 'Por favor, completá todos los campos.';
      return;
    }

    this.isLoading = true; 
    this.errorMessage = ''; 

    this.authService.login({
      username: this.username,
      password: this.password
    }).subscribe({
      next: (response: any) => {
        localStorage.setItem('access', response.access);
        localStorage.setItem('refresh', response.refresh); 

        this.isLoading = false;
        this.router.navigate(['/home']); 
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Usuario o contraseña incorrectas.';
      }
    });
  }

  // PANTALLA 2 : REQUEST OTP - FORGET PASSWORD
  onRequestOTP(event: any) {
    event.preventDefault();

    if (!this.email) {
      this.errorMessage = 'Por favor, ingresá tu email.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.requestOTP(this.email).subscribe({ 
      next: () => {
        this.isLoading = false; 
        localStorage.setItem('reset_email', this.email); 
        this.setView('verify');
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'No se encontró el email.';
      }
    });
  }

  // PANTALLA 3 : VERIFY OTP
  onVerifySubmit(event: any) {
    event.preventDefault();

    if (!this.otp || this.otp.length !== 6) {
      this.errorMessage = 'El código OTP debe tener 6 dígitos.';
      return;
    }

    const email = localStorage.getItem('reset_email'); 

    if (!email) { 
      this.errorMessage = 'Error: email no encontrado.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verifyOTP(email, this.otp).subscribe({
      next: () => {
        this.isLoading = false;
        localStorage.setItem('reset_otp', this.otp); 
        this.setView('reset'); 
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'OTP incorrecto.';
      }
    });
  }

  // PANTALLA 4 : RESET PASSWORD
  onResetSubmit(event: any) {
    event.preventDefault();

    if (!this.newPassword || !this.confirmPassword) {
      this.errorMessage = 'Por favor, completá todos los campos.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.errorMessage = 'Mínimo 8 caracteres.';
      return;
    }

    const email = localStorage.getItem('reset_email'); 
    const otp = localStorage.getItem('reset_otp'); 

    if (!email || !otp) {
      this.errorMessage = 'Datos inválidos.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.resetPassword(email, otp, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;

        localStorage.removeItem('reset_email');  
        localStorage.removeItem('reset_otp'); 
        this.successMessage = 'Contraseña actualizada correctamente';

        setTimeout(() => {
          this.setView('login'); 
        }, 2500);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Error al resetear contraseña.';
      }
    });
  }
}