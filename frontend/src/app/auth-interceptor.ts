import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from './services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('access');

  const reqConToken = token
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      })
    : req;
  // las requests son inmutables, hay que clonarlas para modificarlas

  return next(reqConToken).pipe(

    catchError((error: HttpErrorResponse) => {

      if (error.status === 401) {

        const refreshToken = localStorage.getItem('refresh');

        if (refreshToken) {
          return authService.refreshAccessToken(refreshToken).pipe(
            // llama al backend para obtener un nuevo access token

            switchMap((response: any) => {
              // cuando llega el nuevo token, reintentamos la request original
              localStorage.setItem('access', response.access);

              const reqReintentar = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${response.access}`
                }
              });
              return next(reqReintentar);
            }),

            catchError(() => {
              authService.logout();
              router.navigate(['/login']);
              return throwError(() => error);
            })
          );
        }

        authService.logout();
        router.navigate(['/login']);
      }

      return throwError(() => error);
      })
  );
};