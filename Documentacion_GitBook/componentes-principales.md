# Componentes principales

### Modulo de Registro

* Permite la creación de una cuenta en la plataforma.
* Guarda información relevante como el nombre, empresa, NIT, tipo de documento, numero de documento, sector, país, tamaño organizacional, correo, teléfono, contraseña.
* Validación sobre que el correo no esté registrado previamente.
* Activación de cuenta mediante SMS o correo.
* Cifra los datos sensibles en la base de datos.

### Modulo de Inicio de Sesión

* Permite acceso con credenciales.
* Autenticación 2FA.
* Control de acceso a módulos privados según rol (empresa o administrador).

### Modulo de Formulario de Evaluación

* Cuestionario estructurado por criterios técnicos, éticos de marcos normativos.
* Cálculo de puntaje automático.
* Envío del formulario a n8n para automatización de envió de resultado y generación de la hoja de ruta personalizada.

### Modulo de Carga de Archivos

* Permite a la organización subir documentos relacionados con sus políticas o reportes.

### Modulo de Generación de Resultados

* Visualización de resultados en pantalla con graficas integradas.

### Modulo de Hoja de Ruta

* Descarga de hoja de ruta personalizada en archivo PDF.
