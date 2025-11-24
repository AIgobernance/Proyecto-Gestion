# Configuración SMTP para Envío de Correos

Este archivo documenta la configuración necesaria para el servicio SMTP que se utiliza para enviar correos electrónicos de activación de cuenta.

## Variables de Entorno Requeridas

Agrega las siguientes variables a tu archivo `.env`:

```env
# Configuración de Mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu-contraseña-de-aplicacion
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=tu-email@gmail.com
MAIL_FROM_NAME="Nombre de tu Aplicación"

# Configuración JWT
JWT_SECRET=base64:tu-clave-secreta-jwt
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24
JWT_ACTIVATION_URL=http://localhost:8000/verify-email
```

## Configuración para Gmail

Si usas Gmail, necesitas:

1. **Habilitar "Acceso de aplicaciones menos seguras"** (no recomendado) O
2. **Crear una Contraseña de Aplicación** (recomendado):
   - Ve a tu cuenta de Google
   - Seguridad → Verificación en 2 pasos
   - Contraseñas de aplicaciones
   - Genera una nueva contraseña para "Correo"
   - Usa esa contraseña en `MAIL_PASSWORD`

## Configuración para Otros Proveedores

### Outlook/Hotmail
```env
MAIL_HOST=smtp-mail.outlook.com
MAIL_PORT=587
MAIL_ENCRYPTION=tls
```

### SendGrid
```env
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=tu-api-key-de-sendgrid
MAIL_ENCRYPTION=tls
```

### Mailgun
```env
MAIL_MAILER=mailgun
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=tu-usuario-mailgun
MAIL_PASSWORD=tu-contraseña-mailgun
```

## Generar JWT_SECRET

Para generar una clave secreta JWT segura, ejecuta:

```bash
php artisan key:generate
```

Y luego copia el valor de `APP_KEY` a `JWT_SECRET`, o genera una nueva:

```bash
php -r "echo 'JWT_SECRET=' . base64_encode(random_bytes(32)) . PHP_EOL;"
```

## Verificación

Para probar la configuración, puedes usar:

```bash
php artisan tinker
```

Y luego:

```php
Mail::raw('Test email', function ($message) {
    $message->to('tu-email@ejemplo.com')
            ->subject('Test Email');
});
```

## Notas Importantes

- **Seguridad**: Nunca commitees el archivo `.env` con credenciales reales
- **Producción**: Usa variables de entorno seguras en tu servidor
- **Rate Limiting**: Algunos proveedores SMTP tienen límites de envío diario
- **SPF/DKIM**: Configura estos registros DNS para mejorar la deliverabilidad

