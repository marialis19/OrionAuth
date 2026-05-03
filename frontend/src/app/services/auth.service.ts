import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient) {}

  login(data: any) {
    return this.http.post(`${this.apiUrl}/login/`, data);
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access');
  }

  logout() {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
  }

  requestOTP(email: string) {
    return this.http.post(`${this.apiUrl}/request-otp/`, { email });
  }

  verifyOTP(email: string, otp: string) {
    return this.http.post(`${this.apiUrl}/verify-otp/`, { email, otp });
  }

  resetPassword(email: string, otp: string, new_password: string) {
    return this.http.post(`${this.apiUrl}/reset-password/`, {
      email,
      otp,
      new_password
    });
  }

  refreshAccessToken(refreshToken: string) {
  return this.http.post(`${this.apiUrl}/token/refresh/`, {
    refresh: refreshToken
  });
}

  register(data: { username: string; email: string; password: string; full_name: string }) {
  return this.http.post(`${this.apiUrl}/register/`, data);
}

  getUsername(): string {
    const token = localStorage.getItem('access'); 
    if (!token) return '';
    try {
      const payload = token.split('.')[1]; // payload es la segunda parte del token JWT

      const decoded = JSON.parse(atob(payload)); // Decodificamos el payload base64

      return decoded.username || ''; 
    } catch {
      return ''; 
    }
  }

  getProfile() {
    return this.http.get(`${this.apiUrl}/profile/`); 
  }
} 