# Fullstack Login — Django + Angular

Sistema de autenticación seguro con JWT y recuperación de contraseña 
mediante OTP (One-Time Password). Proyecto fullstack construido desde cero.

---

## Tecnologías

### Backend
- Python 3.12
- Django 6
- Django REST Framework
- SimpleJWT — autenticación con tokens JWT
- SQLite — base de datos de desarrollo

### Frontend
- Angular 21 (standalone components)
- TypeScript
- RxJS — manejo de Observables

---

## Funcionalidades

### Autenticación
- Registro de usuarios
- Login con JWT (access token + refresh token)
- Logout con limpieza de tokens
- Protección de rutas con Guard

### Seguridad
- Contraseñas hasheadas con PBKDF2 (nunca en texto plano)
- Tokens JWT con expiración configurable
- OTP generado con `secrets` (criptográficamente seguro)
- CORS configurado

### Recuperación de contraseña
- Flujo completo de 4 pasos:
  1. El usuario ingresa su email
  2. El sistema genera un OTP de 6 dígitos (válido 10 minutos)
  3. El usuario verifica el código
  4. El usuario establece una nueva contraseña

---

## Estructura del proyecto

fullstack_login/
├── backend/                  ← Django REST API
│   ├── accounts/
│   │   ├── models.py         ← Modelo PasswordResetOTP
│   │   ├── serializers.py    ← Validación de datos
│   │   ├── views.py          ← Lógica de endpoints
│   │   └── urls.py           ← Rutas de la API
│   ├── config/
│   │   └── settings.py       ← Configuración del proyecto
│   └── manage.py
│
└── frontend/                 ← Angular App
└── src/
└── app/
├── components/
│   ├── login/    ← 4 pantallas en un componente
│   └── home/     ← Dashboard con datos del usuario
├── services/
│   └── auth.service.ts
└── auth.guard.ts ← Protección de rutas

---

## Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/register/` | Registro de usuario |
| POST | `/api/login/` | Login — devuelve JWT |
| POST | `/api/request-otp/` | Solicitar código OTP |
| POST | `/api/verify-otp/` | Verificar código OTP |
| POST | `/api/reset-password/` | Restablecer contraseña |

---

## Cómo correr el proyecto

### Backend

```bash
# 1. Crear y activar entorno virtual
python -m venv venv
venv\Scripts\activate       # Windows
source venv/bin/activate    # Mac/Linux

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Aplicar migraciones
python manage.py migrate

# 4. Crear superusuario (opcional, para el admin)
python manage.py createsuperuser

# 5. Correr el servidor
python manage.py runserver
```

El backend queda disponible en `http://127.0.0.1:8000`

### Frontend

```bash
# 1. Instalar dependencias
npm install

# 2. Correr la app
npm start
```

El frontend queda disponible en `http://localhost:4200`

---

## Flujo de autenticación

Usuario      Angular          Django
│         │               │
│── ingresa credenciales─►│                         │
│         │── POST /api/login/ ────►│
│                         │── verifica usuario
│                         │── genera JWT
│         │◄── { access, refresh } ─│
│         │── guarda en localStorage │
│◄── redirige a /home               │

---

## Flujo de recuperación de contraseña

1. Usuario ingresa email↓
2. POST /api/request-otp/ Django genera OTP → lo mprime en consola↓
3. Usuario ingresa el código de 6 dígitos↓
4. POST /api/verify-otp/Django verifica que el código sea válido y no haya expirado↓
5. Usuario ingresa nueva contraseña↓
6. POST /api/reset-password/Django cambia la contraseña y marca el OTP como usado↓
7. Redirige al login automáticamente


---

## Decisiones de seguridad

**¿Por qué OTP y no link por email?**
El OTP expira en 10 minutos y solo puede usarse una vez. 
Es más simple de implementar sin servidor de emails y 
demuestra el mismo concepto de seguridad.

**¿Por qué JWT?**
Es el estándar de la industria para APIs REST. 
Stateless — el servidor no necesita guardar sesiones.

**¿Por qué `secrets` en vez de `random`?**
`secrets` usa el generador de números aleatorios del sistema operativo, 
diseñado para uso criptográfico. `random` es predecible en ciertos contextos.

---

## Autora

**Marialis Aquino**  
Técnico Superior en Desarrollo de Software  
[GitHub](https://github.com/marialis19)