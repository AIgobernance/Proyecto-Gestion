<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Código de Verificación</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f5f5f5;
            padding: 20px;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #4d82bc 0%, #5a8fc9 100%);
            padding: 30px 20px;
            text-align: center;
        }
        .header .logo {
            max-width: 150px;
            height: auto;
        }
        .content {
            padding: 40px 30px;
        }
        .content h1 {
            color: #0f172a;
            font-size: 24px;
            margin-bottom: 20px;
            text-align: center;
        }
        .content p {
            color: #334155;
            font-size: 16px;
            line-height: 1.6;
            margin-bottom: 15px;
        }
        .code-container {
            background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
            border: 2px dashed #4d82bc;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .code {
            font-size: 48px;
            font-weight: 900;
            color: #4d82bc;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
        }
        .warning {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 4px;
            margin: 20px 0;
        }
        .warning p {
            color: #856404;
            font-size: 14px;
            margin: 0;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #6c757d;
            font-size: 12px;
        }
        .button {
            display: inline-block;
            background: linear-gradient(90deg, #4d82bc, #5a8fc9);
            color: #ffffff;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="{{ asset('img/logo-principal.jpg') }}" alt="Logo" class="logo">
        </div>
        <div class="content">
            <h1>¡Hola, {{ $username }}!</h1>
            <p>Has solicitado iniciar sesión en tu cuenta. Para completar el proceso, utiliza el siguiente código de verificación:</p>
            
            <div class="code-container">
                <div class="code">{{ $code }}</div>
            </div>
            
            <p style="text-align: center; font-size: 14px; color: #6c757d;">
                Este código es válido por <strong>10 minutos</strong>.
            </p>
            
            <div class="warning">
                <p><strong>⚠️ Importante:</strong> Si no solicitaste este código, ignora este mensaje. Nunca compartas este código con nadie.</p>
            </div>
            
            <p style="text-align: center; margin-top: 30px;">
                Ingresa este código en la pantalla de verificación para completar tu inicio de sesión.
            </p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} AI Governance Evaluator. Todos los derechos reservados.</p>
            <p style="margin-top: 10px;">Este es un mensaje automático, por favor no respondas a este correo.</p>
        </div>
    </div>
</body>
</html>
