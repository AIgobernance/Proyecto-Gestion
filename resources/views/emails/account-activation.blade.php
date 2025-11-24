<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Activación de Cuenta</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
        }
        .container {
            background-color: #ffffff;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #4d82bc;
        }
        .header h1 {
            color: #4d82bc;
            margin: 0;
            font-size: 28px;
        }
        .content {
            margin-bottom: 30px;
        }
        .welcome-message {
            font-size: 18px;
            color: #2c3e50;
            margin-bottom: 20px;
        }
        .info-box {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #4d82bc;
        }
        .info-item {
            margin: 10px 0;
            padding: 8px 0;
            border-bottom: 1px solid #e0e0e0;
        }
        .info-item:last-child {
            border-bottom: none;
        }
        .info-label {
            font-weight: bold;
            color: #555;
            display: inline-block;
            width: 150px;
        }
        .info-value {
            color: #333;
        }
        .activation-button {
            display: block;
            text-align: center;
            margin: 30px 0;
        }
        .btn {
            background-color: #4d82bc;
            color: #ffffff;
            padding: 15px 40px;
            text-decoration: none;
            border-radius: 5px;
            font-size: 16px;
            font-weight: bold;
            display: inline-block;
            transition: background-color 0.3s;
        }
        .btn:hover {
            background-color: #3a6a9a;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #777;
            font-size: 14px;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
            color: #856404;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>¡Bienvenido a nuestra plataforma!</h1>
        </div>

        <div class="content">
            <p class="welcome-message">
                Hola <strong>{{ $username }}</strong>,
            </p>

            <p>
                Gracias por registrarte en nuestra plataforma. Estamos emocionados de tenerte con nosotros.
            </p>

            <div class="info-box">
                <h3 style="margin-top: 0; color: #4d82bc;">Información de tu registro:</h3>
                
                <div class="info-item">
                    <span class="info-label">Nombre de usuario:</span>
                    <span class="info-value">{{ $username }}</span>
                </div>
                
                <div class="info-item">
                    <span class="info-label">Correo electrónico:</span>
                    <span class="info-value">{{ $email }}</span>
                </div>
                
                @if($company)
                <div class="info-item">
                    <span class="info-label">Empresa:</span>
                    <span class="info-value">{{ $company }}</span>
                </div>
                @endif
                
                <div class="info-item">
                    <span class="info-label">Fecha de registro:</span>
                    <span class="info-value">{{ $registrationDate }}</span>
                </div>
                
                <div class="info-item">
                    <span class="info-label">Hora de registro:</span>
                    <span class="info-value">{{ $registrationTime }}</span>
                </div>
            </div>

            <p>
                Para completar tu registro y activar tu cuenta, por favor haz clic en el siguiente botón:
            </p>

            <div class="activation-button">
                <a href="{{ $activationUrl }}" class="btn">Activar mi cuenta</a>
            </div>

            <div class="warning">
                <strong>⚠️ Importante:</strong> Este enlace expirará en 24 horas. Si no activas tu cuenta en ese tiempo, deberás contactar con soporte.
            </div>

            <p>
                Si el botón no funciona, puedes copiar y pegar el siguiente enlace en tu navegador:
            </p>
            <p style="word-break: break-all; color: #4d82bc; font-size: 12px;">
                {{ $activationUrl }}
            </p>
        </div>

        <div class="footer">
            <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
            <p>Si no te registraste en nuestra plataforma, puedes ignorar este correo.</p>
        </div>
    </div>
</body>
</html>

