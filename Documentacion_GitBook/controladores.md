# Controladores

### Controlador del Registro de Usuario

Endpoint: <kbd>POST /api/auth/register</kbd>

Responsable del registro de nuevos usuarios, validación de datos y creación del registro en la base de datos. Incluye validaciones avanzadas.

* <kbd>usuario</kbd>: El nombre que se necesitara para iniciar sesión.
* <kbd>empresa</kbd>: La empresa que representa el usuario.
* <kbd>nit</kbd>: Número de Identificación Tributaria.
* <kbd>tipoDocumento</kbd>: Tipo de documento que utiliza el Director de TI.
* <kbd>numeroDocumento</kbd>: Numero de documento del Director de TI.
* <kbd>sector</kbd>: Aquí se refiere al sector donde la actividad principal de la empresa está  &#x20;relacionada.
* <kbd>pais</kbd>: País donde está ubicada la empresa.
* <kbd>tamanoOrganizacional</kbd>: Magnitud de la empresa medida por el número de  &#x20;empleados.
* <kbd>correo</kbd>: Correo electrónico donde se enviará la activación de la cuenta o la para  &#x20;autenticación en el inicio de sesión.
* <kbd>telefono</kbd>: Teléfono del Director para autenticación en el inicio de sesión.
* <kbd>contrasena</kbd>: Al menos 8 caracteres con letras, números y caracteres especiales.

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

### Errores

| Código de Error | Descripción          |
| --------------- | -------------------- |
| 422             | Validación fallida.  |
| 409             | Correo ya existente. |
| 500             | Error de registro.   |

### Controlador de Verificación del Token para Activación de Cuenta



### Controlador de Inicio de Sesión

Endpoint: <kbd>POST /api/auth/login</kbd>&#x20;

Inicia sesión con credenciales de Usuario y contraseña, se autentica al usuario mediante una verificación por correo o SMS.

* <kbd>username</kbd>: Nombre de las credenciales del Usuario
* <kbd>password</kbd>: Contraseña registrada.
* <kbd>token</kbd>:Token de un solo uso para .

El controlador valida credenciales, genera tokens JWT y maneja errores de inicio de sesión.

#### Ejemplo de Solicitud

```json
{
    "token": "jwt_aqui",
    "username": {
        "id": 12,
        "username": "Simon R",
        "email": "simonro@gmail.com",
        "password": "Amls.1450"
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



### Controlador de Perfil de Usuario Autenticado

Muestra la información de perfil del usuario y permite obtener y actualizar datos personales y la foto de perfil.

Endpoint: <kbd>GET /api/profile</kbd>

```json
{
  "id": 12,
  "nombre": "Juan Pérez",
  "email": "usuario@correo.com",
  "foto_url": "/uploads/perfil/12.jpg"
}
```

### Controlador de Estadísticas del Dashboard de Usuario



### Controlador de Evaluación de Gobernanza



### Controlador del Registro de Admin

ajsdjaw  <kbd>dsadwad</kbd> dasda

### Controlador de Administración de Usuarios



### Controlador de Token de un solo Uso

