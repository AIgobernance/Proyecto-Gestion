# Sistema de Evaluación de Gobernanza de IA

Sistema web para evaluar y monitorear el nivel de gobernanza de la inteligencia artificial (IA) en las empresas. Permite a las organizaciones completar evaluaciones, generar hojas de ruta automáticas y monitorear el cumplimiento ético y técnico de sus sistemas de IA.

## 🎯 Objetivo Principal

Proporcionar a las organizaciones una plataforma digital que facilite la evaluación de cumplimiento ético y técnico de los sistemas de IA, ofreciendo una hoja de ruta práctica y personalizada para implementar buenas prácticas de gobernanza.

## 🚀 Características Principales

- **Autenticación con 2FA**: Verificación en dos pasos mediante email o SMS
- **Sistema de Evaluación**: Formularios dinámicos para evaluar gobernanza de IA
- **Generación de Hojas de Ruta**: Integración con N8N para generar recomendaciones personalizadas
- **Dashboard Interactivo**: Visualización de resultados y métricas
- **Gestión de Usuarios**: Panel de administración para gestión de usuarios
- **Generación de PDFs**: Exportación de evaluaciones y resultados en formato PDF

## 🛠️ Stack Tecnológico

### Backend
- **Laravel 12** - Framework PHP
- **PHP 8.2+** - Lenguaje de programación
- **MySQL/SQL Server** - Base de datos
- **JWT** - Autenticación con tokens
- **Twilio** - Servicio SMS
- **Browsershot** - Generación de PDFs

### Frontend
- **React 19** - Biblioteca JavaScript
- **React Router** - Enrutamiento
- **Tailwind CSS 4** - Framework CSS
- **Radix UI** - Componentes UI
- **Recharts** - Gráficos y visualizaciones
- **Vite** - Build tool

### Integraciones
- **N8N** - Automatización de workflows
- **SMTP** - Envío de correos electrónicos

## 📋 Requisitos Previos

- PHP 8.2 o superior
- Composer
- Node.js 18+ y npm
- Base de datos (MySQL o SQL Server)
- Servidor web (Apache/Nginx) o PHP built-in server

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd Proyecto-Gestion
   ```

2. **Instalar dependencias de PHP**
   ```bash
   composer install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```
   
   Editar el archivo `.env` con tus configuraciones:
   - Base de datos
   - Configuración de email (SMTP)
   - Credenciales de Twilio (para SMS)
   - URL de N8N

4. **Ejecutar migraciones**
   ```bash
   php artisan migrate
   ```

5. **Instalar dependencias de Node.js**
   ```bash
   npm install
   ```

6. **Compilar assets**
   ```bash
   npm run build
   ```

## 🏃 Ejecución

### Desarrollo

Para ejecutar el proyecto en modo desarrollo:

```bash
composer run dev
```

Este comando ejecuta simultáneamente:
- Servidor Laravel (`php artisan serve`)
- Queue worker (`php artisan queue:listen`)
- Laravel Pail (logs)
- Vite dev server

### Producción

1. **Compilar assets para producción**
   ```bash
   npm run build
   ```

2. **Optimizar Laravel**
   ```bash
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

3. **Iniciar servidor**
   ```bash
   php artisan serve
   ```

## 📁 Estructura del Proyecto

```
Proyecto-Gestion/
├── app/
│   ├── Http/Controllers/     # Controladores
│   ├── Models/               # Modelos Eloquent
│   ├── Services/             # Servicios (Email, SMS, JWT, etc.)
│   ├── Observer/             # Patrón Observer
│   └── Mail/                 # Clases de correo
├── database/
│   ├── migrations/           # Migraciones
│   ├── models/               # Modelos de repositorio
│   └── factories/            # Factories para testing
├── resources/
│   ├── js/                   # Componentes React
│   ├── views/                # Vistas Blade
│   └── css/                  # Estilos
├── routes/
│   └── web.php              # Rutas de la aplicación
├── config/                   # Archivos de configuración
└── public/                   # Archivos públicos
```

## 🔐 Autenticación y Seguridad

- **Autenticación 2FA**: Verificación en dos pasos mediante email o SMS
- **JWT**: Tokens para activación de cuentas
- **CSRF Protection**: Protección contra ataques CSRF
- **Password Reset**: Restablecimiento de contraseña con verificación 2FA

## 📚 Documentación

La documentación completa del proyecto se encuentra en la carpeta `Documentacion_GitBook/`:

- **Arquitectura**: Diseño y estructura del sistema
- **Controladores**: Documentación de endpoints
- **Flujo de Evaluación**: Proceso de evaluación con IA
- **Manual de Usuario**: Guía de uso de la aplicación
- **Pruebas**: Estrategia de testing

## 🧪 Testing

```bash
composer test
```

## 📝 Scripts Disponibles

- `composer setup` - Configuración inicial del proyecto
- `composer dev` - Ejecutar en modo desarrollo
- `composer test` - Ejecutar tests
- `npm run build` - Compilar assets para producción
- `npm run dev` - Modo desarrollo con hot reload

## 🔄 Integración con N8N

El sistema se integra con N8N para:
- Procesamiento de evaluaciones con IA
- Generación de hojas de ruta personalizadas
- Análisis de resultados

Configura la URL de N8N en el archivo `.env`:
```
N8N_URL=https://tu-n8n-instance.com
```

## 📧 Configuración de Email

El sistema requiere configuración SMTP para:
- Activación de cuentas
- Envío de códigos 2FA
- Notificaciones

Ver `config/README_SMTP.md` para más detalles.

## 📱 Configuración de SMS (Twilio)

Para habilitar el envío de SMS, configura tus credenciales de Twilio en `.env`:

```
TWILIO_ACCOUNT_SID=tu_account_sid
TWILIO_AUTH_TOKEN=tu_auth_token
TWILIO_PHONE_NUMBER=tu_numero
```

## 👥 Roles de Usuario

- **Usuario Normal**: Puede completar evaluaciones y ver sus resultados
- **Administrador**: Gestión completa de usuarios y acceso a analytics

## 🐛 Solución de Problemas

Si encuentras problemas, revisa:
- Los logs en `storage/logs/laravel.log`
- La configuración en `.env`
- La documentación en `Documentacion_GitBook/`

## 📄 Licencia

Este proyecto es de uso privado.

## 👨‍💻 Desarrollo

Para contribuir al proyecto:
1. Crear una rama desde `main`
2. Realizar cambios
3. Crear un Pull Request

## 📞 Soporte

Para soporte técnico o consultas, contacta al equipo de desarrollo.

---

**Versión**: 1.0.0  
**Última actualización**: 2024
