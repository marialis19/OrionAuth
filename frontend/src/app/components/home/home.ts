import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { Router, RouterLink } from '@angular/router';

interface UserProfile {
  id: number;
  username: string;
  email: string;
  full_name: string;
  date_joined: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {

  username: string = '';
  firstName: string = '';
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
        this.firstName = data.full_name
          ? data.full_name.split(' ')[0]
          : this.username;
      },
      error: () => {
        this.profileError = 'No se pudo cargar el perfil.';
        this.isLoadingProfile = false;
        this.firstName = this.username;
      }
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}