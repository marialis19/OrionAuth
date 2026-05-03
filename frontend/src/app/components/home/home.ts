import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

interface UserProfile { 
  id: number;
  username: string;
  email: string;
  date_joined: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit { // interfaz de Angular que ejecuta código cuando el componente se inicializa

  username: string = '';
  loginTime: string = '';

  profile: UserProfile | null = null;

  isLoadingProfile: boolean = false;

  profileError: string = '';

  constructor(
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.username = this.authService.getUsername();

    const now = new Date();
    this.loginTime = now.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    this.cargarPerfil();
  }

  cargarPerfil() {
    this.isLoadingProfile = true;

    this.authService.getProfile().subscribe({
      next: (data: any) => {
        this.profile = data;
        this.isLoadingProfile = false;
      },
      error: () => {
        this.profileError = 'No se pudo cargar el perfil.';
        this.isLoadingProfile = false;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}