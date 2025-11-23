# Configuración de Twilio para SMS

## Variables de entorno necesarias

Agrega las siguientes variables a tu archivo `.env`:

```env
# Twilio Configuration
TWILIO_ACCOUNT_SID=tu_account_sid_aqui
TWILIO_AUTH_TOKEN=tu_auth_token_aqui
TWILIO_PHONE_NUMBER=+1234567890
```

## Cómo obtener las credenciales de Twilio

1. **Regístrate en Twilio**: Ve a [https://www.twilio.com](https://www.twilio.com) y crea una cuenta gratuita
2. **Obtén tu Account SID y Auth Token**:
   - Ve al Dashboard de Twilio
   - Encuentra tu "Account SID" y "Auth Token"
   - Cópialos y agrégales al archivo `.env`
3. **Obtén un número de teléfono**:
   - En el Dashboard, ve a "Phone Numbers > Manage > Buy a number"
   - Selecciona un número con capacidad SMS
   - Copia el número (formato: +1234567890) y agréguelo como `TWILIO_PHONE_NUMBER`

## Funcionalidad implementada

- ✅ Generación de códigos de verificación de 6 dígitos aleatorios
- ✅ Envío de SMS via Twilio API
- ✅ Formateo automático de números de teléfono (soporta números colombianos y formato E.164)
- ✅ Validación de códigos SMS (igual que los códigos de email)
- ✅ Manejo de errores y logging
- ✅ Protección contra intentos fallidos (bloqueo después de 3 intentos)

## Uso

Una vez configurado, cuando un usuario seleccione el método SMS en el login:
1. Se generará un código de 6 dígitos aleatorio
2. Se enviará un SMS al número de teléfono registrado del usuario
3. El código será válido por 10 minutos
4. El usuario puede ingresar el código para completar el login

## Notas importantes

- Asegúrate de que los usuarios tengan un número de teléfono válido en la base de datos (columna `Telefono`)
- El formato del número puede ser con o sin código de país (se formateará automáticamente)
- Los códigos SMS se validan de la misma manera que los códigos de email
- Si Twilio no está configurado, el sistema mostrará un error al intentar enviar SMS

