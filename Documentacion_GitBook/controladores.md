---
description: >-
  Para el desarrollo de este aplicativo web se decidió emplear algunos
  controladores mencionados a continuación.
---

# Controladores

### Controlador del Registro de Usuario

Endpoint: `POST /app/auth/registerController`

Permite registrar un nuevo usuario dentro del sistema.\
Todos los usuarios se crean en estado **INACTIVO (**`activate = 0`**)**, a la espera de la activación por correo electrónico.

* `usuario`: El nombre que se necesitara para iniciar sesión.
* `empresa`: La empresa que representa el usuario.
* `nit`: Número de Identificación Tributaria.
* `tipoDocumento`: Tipo de documento que utiliza el Director de TI.
* `numeroDocumento`: Numero de documento del Director de TI.
* `sector`: Aquí se refiere al sector donde la actividad principal de la empresa está  &#x20;relacionada.
* `pais`: País donde está ubicada la empresa.
* `tamanoOrganizacional`: Magnitud de la empresa medida por el número de  &#x20;empleados.
* `correo`: Correo electrónico donde se enviará la activación de la cuenta o la para  &#x20;autenticación en el inicio de sesión.
* `telefono`: Teléfono del Director para autenticación en el inicio de sesión.
* `contrasena`: Al menos 8 caracteres con letras, números y caracteres especiales.

#### Ejemplo de Solicitud

```json
{
  "usuario": "Simon Rodiguez",
  "empresa":"Techno SaS",
  "nit": "9006548612",
  "tipoDocumento": "Cedula de Ciudadania",
  "numeroDocumento":"1108569582",
  "sector":"Industrial",
  "pais":"Colombia",
  "tamanoOrganizacional":"Pequeña (1-50 empleados)",
  "email": "simonrodriguez@gmail.com",
  "telefono":"3178524096",
  "password": "Clave.acceso5183"
}
```

#### Respuesta de la Solicitud

```json
{
  "message": "Usuario registrado con éxito",
  "usuario_id": 45
}
```

#### Errores

<table><thead><tr><th width="94">Código</th><th>Causa</th><th>Respuesta</th></tr></thead><tbody><tr><td><strong>402</strong></td><td>Validación fallida</td><td>Error de validación, descripción detallada.</td></tr><tr><td><strong>403</strong></td><td>Correo duplicado</td><td>El correo electrónico ya está registrado</td></tr><tr><td><strong>405</strong></td><td>Documento duplicado</td><td>Ya existe un usuario registrado con este documento</td></tr><tr><td><strong>500</strong></td><td>Error interno</td><td>Error inesperado al crear el usuario o enviar correo.</td></tr></tbody></table>

#### **Funciones adicionales manejadas por este controlador**

* Generación de **token de activación JWT**.
* Envío de **correo de activación** usando `EmailService`.
* Registro de evento mediante `ObserverManager` **/** `NotificadorUsuarioRegistrado`.
* Registro detallado de logs para debugging.

### Controlador de Verificación del Token para Activación de Cuenta

El **EmailVerificationController** es responsable de validar el token enviado al correo electrónico del usuario durante el registro.\
Su función principal es asegurar que el token JWT sea válido, corresponda a un usuario existente y activar la cuenta cambiando su estado a `Activate = 1`.

Endpoint: `GET /app/auth/EmailVerificationController`

Este endpoint recibe el token de activación generado durante el registro del usuario y se encarga de:

1. Validar el token JWT.
2. Verificar que el token incluya un `user_id` y un `email`.
3. Confirmar que el usuario existe en la base de datos.
4. Validar que el email del token coincida con el del usuario.
5. Cambiar el estado del usuario a **activado** (`Activate = 1`) si aún no lo está.
6. Retornar una respuesta JSON o una vista, dependiendo del tipo de solicitud.

#### Ejemplo de Solicitud

```bash
GET /api/auth/verify-email?token=eyJhbGciOiJIUzI1...
```

#### Resultado de la Solicitud

**Si la activas por primera vez:**

```json
{
  "message": "Cuenta activada exitosamente",
  "success": true
}
```

**Si ya estaba activa:**

```json
{
  "message": "Tu cuenta ya está activada",
  "already_activated": true
}
```

#### Errores

<table><thead><tr><th width="94">Código</th><th>Causa</th></tr></thead><tbody><tr><td><strong>422</strong></td><td>Token no enviado, token malformado o email no coincide.</td></tr><tr><td><strong>404</strong></td><td>Usuario asociado al token no existe.</td></tr><tr><td><strong>500</strong></td><td>Token inválido, expirado o error interno en la verificación.</td></tr></tbody></table>

El controlador realiza las siguientes operaciones:

1. **Logs iniciales**\
   Registra información de la solicitud para auditoría y diagnóstico.
2. **Obtención del token**\
   Extrae `token` desde los parámetros de la URL.
3. **Validación del token**\
   Usa `JwtService::validateToken` para decodificar y verificar firma + expiración.
4. **Validación de estructura**\
   Verifica que el payload contenga los campos indispensables:
   * `user_id`
   * `email`
5. **Obtención del usuario**\
   Busca en la BD mediante `UsuarioRepository::obtenerPorId`.
6. **Comparación de correos**\
   Evita activaciones fraudulentas.
7. **Revisión del estado actual (`Activate`)**\
   Si ya está activo, responde sin error.
8. **Activación del usuario.**
9. **Respuesta a la Solicitud.**

### Controlador de Inicio de Sesión

Endpoint: `POST /api/auth/login`&#x20;

Inicia sesión con credenciales de Usuario y contraseña, se autentica al usuario mediante una verificación por correo o SMS.

* `username`: Nombre de las credenciales del Usuario
* `password`: Contraseña registrada.
* `token`:Token de un solo uso para .

El controlador valida credenciales, genera tokens JWT y maneja errores de inicio de sesión.

#### Ejemplo de Solicitud

```json
{
    "token": "jwt_aqui",
    "username": {
        "id": 12,
        "username": "Simon R",
        "email": "simonrodriguez@gmail.com",
        "password": "Clave.acceso5183"
    }
}
```

#### Respuesta de la Solicitud

```json
{
    "success": true
}
```

### Controlador de Restablecimiento de Contraseña

Permite restablecer la contraseña de un usuario registrado dentro del sistema de gobernanza. El usuario debe proporcionar su correo, la nueva contraseña y la confirmación de la misma. El controlador valida la información, verifica si el usuario existe y actualiza la contraseña en la base de datos.

Endpoint: `POST /api/passwordResetConntroller`

* `usuario`: Nombre de usuario registrado.
* `newPassword`: Nueva contraseña del usuario.
* `confirmPassword`: Es una confirmación de la nueva contraseña (debe ser igual al campo anterior).

#### Ejemplo de Solicitud

```json
{
  "email": "usuario@example.com",
  "newPassword": "NuevaClave123",
  "confirmPassword": "NuevaClave123"
}
```

#### Resultado de la Solicitud

```json
{
  "message": "Contraseña restablecida correctamente"
}
```

#### Errores

<table><thead><tr><th width="94">Código</th><th>Causa</th></tr></thead><tbody><tr><td><strong>422</strong></td><td>Token no enviado, token malformado o email no coincide.</td></tr><tr><td><strong>404</strong></td><td>Usuario asociado al token no existe.</td></tr><tr><td><strong>500</strong></td><td>Token inválido, expirado o error interno en la verificación.</td></tr></tbody></table>

Es importante resaltas que antes de restablecer se envía un codigo de verificación como confirmación de que realmente el dueño de la cuenta esta actualizando la contraseña.

### Controlador de Perfil de Usuario Autenticado

Muestra la información de perfil del usuario y permite obtener y actualizar datos personales y la foto de perfil.

Endpoint: <kbd>GET /api/profile</kbd>&#x20;

* <kbd>id</kbd>: Identificador de cada usuario.
* <kbd>usuario</kbd>: El nombre que se necesitara para iniciar sesión.
* <kbd>correo</kbd>: Correo electrónico donde se enviará la activación de la cuenta o la para  &#x20;autenticación en el inicio de sesión.
* <kbd>telefono</kbd>: Teléfono del Director para autenticación en el inicio de sesión.
* <kbd>foto\_url</kbd>: Foto predeterminada de cada usuario que puede actualizarse.

#### Ejemplo de Solicitud

```json
{
  "id":12,
  "usuario":"Simon R",
  "correo":"simonrodriguez@gmail.com",
  "telefono":"3178524096",
  "foto_url":"/uploads/perfil/12.jpg"
}
```

#### Resultado de Solicitud

```json
{
  "message": "Cuenta actualizada exitosamente",
  "success": true
}
```

### Controlador de Estadísticas del Dashboard de Usuario

Este controlador gestiona estadísticas del dashboard, tanto para usuarios autenticados como para administradores, y el listado completo de evaluaciones del usuario.

Endpoints: `/api/dashboard/stats` `/api/dashboard/evaluations` `/api/dashboard/stats/general`

#### Obtener estadísticas del dashboard del usuario

Retorna las estadísticas personalizadas del dashboard para el **usuario autenticado**. Los datos vienen desde `EvaluacionRepository` y pueden estar cacheados durante 30 segundos para mejorar rendimiento.

Endpoint: `GET /api/dashboard/stats`

**Ejemplo de Solicitud**

```bash
GET /api/dashboard/stats
```

**Resultado de Solicitud**

```json
{
  "success": true,
  "data": {
    "totalEvaluaciones": 12,
    "completadas": 8,
    "pendientes": 4,
    "promedioAvance": 66
  }
}
```

#### Obtener evaluaciones del usuario autenticado

Obtiene todas las evaluaciones asociadas al usuario autenticado.

* Validación de sesión.
* Conteo de evaluaciones en BD.
* Formateo de evaluaciones vía `EvaluacionRepository` .

Endpoint: `GET /api/dashboard/evaluations`&#x20;

#### Obtener estadísticas generales (administrador)

Endpoint: `GET /api/dashboard/stats/general`

Retorna estadísticas globales del sistema:

* Total de usuarios
* Total de evaluaciones
* Total de documentos
* Tendencias de los últimos meses
* Distribución por marco de gobernanza
* Documentos por mes
* Porcentajes de cambio

Este realiza múltiples consultas directas a la BD, incluye validación de columnas existentes y manejo de excepciones parciales.

**Ejemplo de Solicitud**

```bash
GET /api/dashboard/stats/general?refresh=true
```

**Resultado de Solicitud**

```json
{
  "success": true,
  "data": {
    "kpis": {
      "users": { "current": 150, "percentChange": 12.5 },
      "evaluations": { "current": 320, "percentChange": -5.0 },
      "documents": { "current": 89, "percentChange": 3.2 }
    },
    "userTrend": [
      { "month": "Jan", "users": 20 },
      { "month": "Feb", "users": 35 }
    ],
    "evaluationsPerMonth": [
      { "month": "Jan", "evaluations": 40 },
      { "month": "Feb", "evaluations": 55 }
    ],
    "distributionByFramework": [
      { "name": "COBIT", "value": 55, "color": "#3b82f6" },
      { "name": "ISO", "value": 43, "color": "#8b5cf6" }
    ],
    "documentsPerMonth": [
      { "month": "Jan", "documents": 10 },
      { "month": "Feb", "documents": 15 }
    ]
  }
}

```

### Controlador de Evaluación de Gobernanza



### Controlador del Registro de Admin

Permite registrar un **usuario administrador** dentro del sistema de gobernanza. El registro aplica únicamente para cuentas internas con rol administrativo.

Endpoint: `POST /api/AdminRegisterController`

* `usuario`: Nombre del administrador para el inicio.
* `tipoDocumento`: CC, CE o el pasaporte.
* `numeroDocumento`: Número del documento de identificación.
* `correo`: Correo electrónico válido y único.
* `telefono`: Número telefónico del administrador.
* `contrasena`: Contraseña de acceso (mínimo 8 caracteres).

#### Ejemplo de Solicitud

```json
{
  "nombre": "Carlos Rodríguez",
  "tipoDocumento": "CC",
  "numeroDocumento": "1234567890",
  "correo": "carlos.admin@gobernanza.com",
  "telefono": "3001234567",
  "contrasena": "AdminSeguro123",
}
```

#### Resultado de Solicitud

```json
{
  "message": "Administrador registrado correctamente",
}
```

#### Errores

<table><thead><tr><th width="94">Código</th><th>Causa</th><th>Respuesta</th></tr></thead><tbody><tr><td><strong>402</strong></td><td>Validación fallida</td><td>Error de validación, descripción detallada.</td></tr><tr><td><strong>403</strong></td><td>Correo duplicado</td><td>El correo electrónico ya está registrado</td></tr><tr><td><strong>405</strong></td><td>Documento duplicado</td><td>Ya existe un usuario registrado con este documento</td></tr><tr><td><strong>500</strong></td><td>Error interno</td><td>Error inesperado al crear el usuario o enviar correo.</td></tr></tbody></table>

### Controlador de Administración de Usuarios

#### Obtener Lista de Usuarios

Devuelve una lista paginada de usuarios registrados en el sistema.\
Permite especificar `limit` y `offset` para paginación.

#### Activar o Desactivar Usuario

Alterna el estado de un usuario entre activo e inactivo.

#### Restablecer la contraseña

Permite que un administrador cambie la contraseña de un usuario mediante su correo.

* usuario: Nombre del usuario al que se actualiza contraseña.
* nuevaContrasena: Nueva contraseña del usuario.
* confirmarContrasena: Confirmación de nueva contraseña.

**Ejemplo de Solicitud**

```json
{
  "usuario": "Simon R",
  "nuevaContrasena": "Nueva12345",
  "confirmarContrasena": "Nueva12345"
}
```

**Resultado de Solicitud**

```json
{
  "message": "Contraseña restablecida correctamente"
}
```

**Errores**

<table><thead><tr><th width="92">Código</th><th>Motivo</th></tr></thead><tbody><tr><td>422</td><td>Validación fallida</td></tr><tr><td>404</td><td>Usuario no encontrado</td></tr><tr><td>500</td><td>Error interno</td></tr></tbody></table>

### Controlador de Token de un solo Uso

El **CsrfController** proporciona el **token CSRF** generado por el servidor. Este token es necesario para proteger el sistema frente a ataques **Cross-Site Request Forgery**, especialmente cuando el frontend necesita enviar solicitudes POST, PUT, PATCH o DELETE desde clientes externos o aplicaciones SPA.

Endpoint: GET /app/csrfcontroller

#### Ejemplo de Solicitud

```bash
GET /api/csrf
```

#### Resultado de Solicitud

```json
{
  "token": "b1s02Kd93jf83hskw9slAjs8dhs8s9ssjs0sjJH"
}
```

