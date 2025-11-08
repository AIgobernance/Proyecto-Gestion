# Manual de Usuario

### Introducción

El presente manual tiene como objetivo guiar al usuario en el uso del aplicativo web “Gobernanza de IA en las Empresas”, una herramienta digital que permite realizar evaluaciones sobre la gestión ética, legal y técnica de la inteligencia artificial dentro de una organización.

El sistema genera automáticamente una hoja de ruta personalizada con recomendaciones y acciones de mejora, basadas en los resultados de la evaluación y el análisis implementado con los marcos normativos.

### Requisitos del sistema

#### Requisitos técnicos mínimos:

* Navegador web actualizado (Google Chrome, Edge, Firefox o Safari).
* Conexión estable a Internet.
* Resolución mínima recomendada: 1366x768 px (corregir).
* Acceso a correo electrónico y teléfono móvil (para validación 2FA).

#### **Requisitos de Acceso:**

* Contar con un usuario registrado y verificado.
* Poseer documentos o políticas internas de IA (opcional, para carga en la evaluación).

### Acceso al sistema

#### Ingreso al portal

1. Abrir el navegador y acceder a la URL del sistema:\
   **https://gobernanza-ia.empresa.com**
2. Seleccionar una de las siguientes opciones:
   * **Iniciar sesión** (si ya tiene cuenta).
   * **Registrarse** (si es la primera vez que accede).

### Registro de usuario

1. Ingrese los datos de la empresa y del representante responsable.
2. Proporcione su correo electrónico y número de teléfono.
3. Recibirá un código de verificación (2FA):
   * Por correo electrónico (vía SMTP).
   * O por SMS (vía proveedor de mensajería).
4. Ingrese el código en la pantalla de validación.
5. Su cuenta quedará activa y podrá iniciar sesión.

### Inicio de sesión

1. Diríjase a la pantalla de Inicio de sesión.
2. Ingrese su correo electrónico y contraseña.
3. Valide el segundo factor (2FA).
4. Accederá al panel principal del aplicativo.

### Flujo general de uso

1. Iniciar sesión en la plataforma.
2. Acceder al módulo de Evaluación.
3. Completar las preguntas del formulario de gobernanza de IA.
4. Presionar el botón “Finalizar evaluación”.
5. El sistema enviará las respuestas a n8n, que coordina el análisis con una IA evaluadora.
6. La IA genera un puntaje global y una hoja de ruta personalizada.
7. El usuario puede visualizar los resultados en pantalla.
8. Finalmente, puede descargar la hoja de ruta en formato PDF.

### Descripción de módulos del sistema

#### Módulo de Registro

Permite crear una cuenta de usuario y validar la identidad mediante el sistema de doble autenticación (2FA).

* Campos requeridos: nombre, empresa, NIT, tipo de documento, numero de documento, sector, país, tamaño organizacional, correo, teléfono, contraseña.
* Mensajes automáticos de confirmación (correo o SMS).

#### Módulo de Inicio de Sesión

Permite acceder a la plataforma una vez el usuario está registrado y verificado.

* Permite acceso con credenciales.
* Autenticación 2FA.
* Control de acceso a módulos privados según rol (empresa o administrador).









