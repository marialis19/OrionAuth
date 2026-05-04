# OrionAuth

Sistema de autenticación seguro con JWT y recuperación de contraseña 
mediante OTP (One-Time Password). Proyecto fullstack construido desde cero.

---

## ¿ Por qué este proyecto ?

Básicamente quise entender cómo funciona la autenticació real, no sólo un login básico sino el flujo completo: tokens, expiración, recuperación segura de cuenta. Ir entendiendo a medida de probar el flujo.

---   

## Stack Tecnológico

**Backend** - Python 3.12 - Django 6 + Django REST Framework - SimpleJWT — autenticación con tokens JWT - SQLite (desarrollo)

**Frontend** — Angular 21 (standalone components) + TypeScript - RxJS — manejo de Observables

---

## Funcionalidades

### Autenticación
- Registro de usuarios con nombre completo, usuario y validación de contraseña en tiempo real
- Login con JWT — access token (60 min) + refresh token (1 día)
- "Recordarme" - extiende el refresh token a 30 días
- Logout con limpieza de tokens
- Protección de rutas con Guard

### Seguridad
- Contraseñas hasheadas con PBKDF2 (nunca en texto plano)
- Tokens JWT con expiración configurable
- OTP generado con `secrets`
- CORS configurado

### Recuperación de contraseña
- Flujo completo de 4 pasos:
  1. El usuario ingresa su email
  2. El sistema genera un OTP de 6 dígitos (válido 10 minutos)
  3. El usuario verifica el código
  4. El usuario establece una nueva contraseña

---

## Decisiones de Seguridad

**OTP en consola en vez de email real**  
En producción esto sería un email. Lo simulé en consola para no depender
de un servidor SMTP y mantener el foco en el flujo de seguridad.

**`secrets` en vez de `random` para generar el OTP**  
`random` en Python no es criptográficamente seguro — puede predecirse.
`secrets` usa el generador del sistema operativo, diseñado para este tipo de casos.

**JWT stateless**  
El servidor no guarda sesiones. El token se verifica en cada request
sin tocar la base de datos — más escalable y es el estándar de la industria.

**Nombre completo separado del username**  
El username es el identificador técnico (sin espacios, sin caracteres especiales).
El nombre completo es para personalizar la experiencia — como lo hacen Gmail o Notion.

--- 

## Endpoints de la API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/register/` | Crear cuenta |
| POST | `/api/login/` | Login — devuelve access + refresh token |
| GET  | `/api/profile/` | Datos del usuario autenticado |
| POST | `/api/request-otp/` | Solicitar código de recuperación |
| POST | `/api/verify-otp/` | Verificar el código |
| POST | `/api/reset-password/` | Cambiar contraseña |
| POST | `/api/token/refresh/` | Renovar access token |

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

# 4. Correr el servidor
python manage.py runserver
```

Disponible en `http://127.0.0.1:8000`

### Frontend

```bash
# 1. Instalar dependencias
npm install

# 2. Correr la app
npm start
```

Disponible en `http://localhost:4200`

---

## Estructura

OrionAuth/
├── backend/
│   ├── accounts/
│   │   ├── models.py       → modelo OTP
│   │   ├── serializers.py  → validación de datos
│   │   ├── views.py        → lógica de cada endpoint
│   │   └── urls.py         → rutas
│   └── config/
│       └── settings.py     → configuración general
│
└── frontend/
└── src/app/
├── components/
│   ├── login/       → 4 pantallas (login, forgot, verify, reset)
│   ├── register/    → registro con validaciones en tiempo real
│   └── home/        → dashboard con datos del perfil
├── services/
│   └── auth.service.ts → todas las llamadas a la API
├── auth.guard.ts    → protección de rutas
└── auth.interceptor.ts → agrega el token a cada request

---

## Autora

**Marialis Aquino**  
Técnico Superior en Desarrollo de Software  
[GitHub](https://github.com/marialis19)