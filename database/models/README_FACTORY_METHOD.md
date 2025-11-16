# Patrón Factory Method - Implementación

## Descripción

Este proyecto implementa el patrón de diseño **Factory Method** para gestionar la creación de diferentes tipos de usuarios (Usuario Normal y Administrador) de manera extensible y mantenible.

## Estructura del Patrón

### 1. Producto Abstracto
**Archivo:** `database/models/UsuarioInterface.php`

Define la interfaz común que todos los tipos de usuarios deben implementar:
- `getRol()`: Obtiene el rol del usuario
- `getNombre()`: Obtiene el nombre del usuario
- `getCorreo()`: Obtiene el correo del usuario
- `getId()`: Obtiene el ID del usuario
- `autenticar(string $password)`: Autentica al usuario
- `cerrarSesion()`: Cierra la sesión de forma segura
- `recuperarContrasena(string $nuevaContrasena)`: Permite recuperar la contraseña
- `toArray()`: Convierte el usuario a array para respuestas JSON

### 2. Productos Concretos
**Archivos:**
- `database/models/UsuarioNormal.php` - Implementa `UsuarioInterface` para usuarios normales
- `database/models/Administrador.php` - Implementa `UsuarioInterface` para administradores

Cada clase concreta implementa los métodos de la interfaz con lógica específica para su tipo de usuario.

### 3. Creator Abstracto
**Archivo:** `database/factories/UsuarioFactory.php`

Clase abstracta que define el método factory:
- `crearUsuario(array $datos): UsuarioInterface` - Método abstracto que las subclases deben implementar
- `prepararDatos(array $datos): array` - Método helper para preparar datos comunes

### 4. Creators Concretos
**Archivos:**
- `database/factories/UsuarioNormalFactory.php` - Crea instancias de `UsuarioNormal`
- `database/factories/AdministradorFactory.php` - Crea instancias de `Administrador`

Cada factory concreta implementa `crearUsuario()` para crear el tipo específico de usuario.

### 5. Factory Manager
**Archivo:** `database/factories/UsuarioFactoryManager.php`

Clase helper que facilita la selección de la factory correcta:
- `getFactory(string $tipoUsuario): UsuarioFactory` - Obtiene la factory apropiada
- `crearUsuario(array $datos, ?string $tipoUsuario = null): UsuarioInterface` - Crea un usuario usando la factory correcta

## Cómo se Soluciona Cada Requerimiento

### RF 1: Registro de empresas por formulario
**Solución:** `RegisterController` usa `UsuarioFactoryManager::crearUsuario()` con rol 'usuario', que instancia `UsuarioNormalFactory` y crea un objeto `UsuarioNormal`.

### RF 2: Ingreso al aplicativo por formulario
**Solución:** `LoginController` usa `UsuarioRepository->autenticar()` que internamente usa `UsuarioFactoryManager` para crear la instancia correcta según el rol del usuario encontrado en la BD.

### RF 3: Formulario de registro para administradores
**Solución:** `AdminRegisterController` usa `UsuarioFactoryManager::crearUsuario()` con rol 'admin', que instancia `AdministradorFactory` y crea un objeto `Administrador`.

### RF 4: Cerrar sesión de forma segura
**Solución:** `LoginController->logout()` usa `UsuarioFactoryManager` para crear la instancia del usuario desde la sesión y llama a `cerrarSesion()`, que tiene lógica específica según el tipo de usuario.

### RF 5: Recuperar contraseña
**Solución:** Todos los tipos de usuario implementan `recuperarContrasena()` en la interfaz, permitiendo que cualquier tipo de usuario pueda recuperar su contraseña usando la misma interfaz.

## Uso del Patrón

### Crear un Usuario Normal
```php
use Database\Factories\UsuarioFactoryManager;

$datos = [
    'usuario' => 'Juan',
    'correo' => 'juan@example.com',
    'contrasena' => 'password123',
    'rol' => 'usuario',
    // ... otros datos
];

$usuario = UsuarioFactoryManager::crearUsuario($datos, 'usuario');
// Retorna una instancia de UsuarioNormal
```

### Crear un Administrador
```php
use Database\Factories\UsuarioFactoryManager;

$datos = [
    'usuario' => 'Admin',
    'correo' => 'admin@example.com',
    'contrasena' => 'password123',
    'rol' => 'admin',
    // ... otros datos
];

$admin = UsuarioFactoryManager::crearUsuario($datos, 'admin');
// Retorna una instancia de Administrador
```

### Autenticar un Usuario
```php
use Database\Models\UsuarioRepository;

$repository = new UsuarioRepository();
$usuario = $repository->autenticar('correo@example.com', 'password123');
// Retorna UsuarioInterface (UsuarioNormal o Administrador según el rol en BD)
```

### Cerrar Sesión
```php
$usuario->cerrarSesion(); // Lógica específica según el tipo de usuario
```

## Ventajas del Patrón

1. **Extensibilidad**: Fácil agregar nuevos tipos de usuarios (ej: Moderador, Editor) sin modificar código existente
2. **Separación de responsabilidades**: Cada factory maneja la creación de su tipo específico
3. **Polimorfismo**: Todos los usuarios comparten la misma interfaz, facilitando el manejo uniforme
4. **Mantenibilidad**: Cambios en la creación de un tipo de usuario no afectan a otros
5. **Testabilidad**: Fácil crear mocks y tests unitarios para cada tipo de usuario

## Extensión Futura

Para agregar un nuevo tipo de usuario (ej: Moderador):

1. Crear `database/models/Moderador.php` que implemente `UsuarioInterface`
2. Crear `database/factories/ModeradorFactory.php` que extienda `UsuarioFactory`
3. Actualizar `database/factories/UsuarioFactoryManager::getFactory()` para incluir el nuevo tipo
4. ¡Listo! El sistema automáticamente puede crear moderadores

