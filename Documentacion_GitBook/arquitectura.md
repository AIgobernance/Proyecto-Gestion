# Arquitectura

### Documentación de la Arquitectura

El aplicativo web utiliza una arquitectura de 4 capas, compuesta por un frontend desarrollado con react para la interfaz del usuario, un backend construido con laravel para controla la lógica del negocio, gestionar la seguridad y coordinar la comunicación entre las capas, integraciones con servicios externos como N8N, SMS y SMTP, por ultimo tenemos la base de datos en SQL Server para almacenamiento de datos.

#### Frontend - React <a href="#frontend-react" id="frontend-react"></a>

El frontend del aplicativo web está desarrollado utilizando React, una biblioteca de JavaScript de código abierto para construir interfaces de usuario interactivas y dinámicas. React utiliza componentes reutilizables para representar las interfaces del usuario, lo que facilita la creación del aplicativo y facilita el mantenimiento. Las interfaces de usuario se visualizan en los navegadores web y permite interactuar con la aplicación de forma intuitiva.

#### Backend - Laravel <a href="#backend-laravel" id="backend-laravel"></a>

El backend de la aplicación está construido utilizando Laravel, un framework de desarrollo web de código abierto basado en PHP. Laravel proporciona un conjunto de herramientas y características que simplifican el desarrollo del aplicativo web. Se encarga de manejar las solicitudes del cliente, procesar la lógica del servidor, interactuar con los servicios externos y con la base de datos para generar una solución a las necesidades del usuario en el aplicativo.

Laravel va de la mano con el patrón de diseño Modelo-Vista-Controlador (MVC), lo que facilita la separación de preocupaciones y el desarrollo organizado. Los controladores de Laravel gestionan las solicitudes HTTP, interactúan con los servicios externos mediante peticiones en JSON, además, interactúan con la base de datos, envían los datos para obtener una respuesta a la petición del usurario para mostrarla al cliente. Los modelos representan los datos de la aplicación y proporcionan métodos para realizar operaciones en la base de datos y métodos para utilizar estos servicios externos. Las vistas definen la estructura y el diseño del aplicativo web y se generan dinámicamente con los datos proporcionados por el controlador.

#### Servicios Externos - N8N, SMS, SMTP

La capa de servicios externos actúa como un conjunto de integraciones que complementan la funcionalidad del backend, permitiendo automatizar procesos, validar la autenticación de usuarios y gestionar la comunicación con el cliente. Esta capa está conformada principalmente por los servicios N8N, SMS y SMTP, que se comunican directamente con Laravel a través de peticiones HTTP y eventos internos del sistema.

**N8N – Automatización y comunicación con IA**

Este servicio se integra al aplicativo mediante webhooks configurados desde Laravel. Su función principal es automatizar los procesos posteriores a la evaluación de gobernanza de IA realizada por las organizaciones.\
Cuando el usuario completa el formulario de evaluación, el backend envía los datos del resultado a N8N a través de una solicitud HTTP en formato JSON.

**Servicio SMS/SMTP – Autenticación en dos factores (2FA)**

Los proveedores de servicios (SMTP/SMS) se utiliza para implementar la función de autenticación en dos pasos (2FA) durante el inicio de sesión, en el registro solo se permite la utilización de SMTP.\
Cuando un usuario intenta iniciar sesión o completar su registro, Laravel genera un código temporal de verificación que se envía mediante estos servicios. El usuario debe ingresar este código en la interfaz (frontend) para confirmar su identidad.

Esta integración refuerza la seguridad del aplicativo, evitando accesos no autorizados y garantizando que cada cuenta esté asociada a una identidad real. La comunicación se realiza a través de la API REST del proveedor, enviando solicitudes HTTP desde el backend con los datos del usuario y el código generado.

#### Base de Datos - SQL Server <a href="#base-de-datos-mysql" id="base-de-datos-mysql"></a>

La base de datos utilizada en el aplicativo web es SQL Server, un sistema de gestión de bases de datos relacionales. Este se encarga de almacenar y administrar los datos del aplicativo de manera eficiente y segura. Proporciona tablas estructuradas con filas y columnas para definir relaciones entre ellas.

#### Flujo de Datos <a href="#flujo-de-datos" id="flujo-de-datos"></a>

El proceso inicia en el frontend, donde los usuarios interactúan con la interfaz desarrollada en React. Desde allí, se generan solicitudes HTTP que son enviadas al backend construido en Laravel.

Una vez que la solicitud llega al backend, Laravel procesa los datos recibidos, valida la información y ejecuta la lógica del negocio correspondiente. En el caso del registro, el backend valida los campos y utiliza el servicio SMTP para enviar un correo de verificación. Si se trata de un inicio de sesión, se activa el servicio de autenticación en dos factores (2FA) que, según el caso, puede enviar un código de validación al correo electrónico mediante SMTP o al teléfono móvil a través de SMS. Este flujo asegura que el acceso al sistema esté protegido y que cada acción sea verificada correctamente.

Cuando el usuario completa el formulario de evaluación de gobernanza de IA, los datos son enviados nuevamente al backend, donde se almacenan temporalmente y, posteriormente, son transmitidos al servicio externo N8N mediante una solicitud HTTP en formato JSON. En N8N se activa un flujo automatizado que puede enviar los datos a una inteligencia artificial para su análisis, generar un reporte con los resultados y construir una hoja de ruta personalizada. El resultado del flujo se retorna al backend, el cual almacena la información final en la base de datos y la pone a disposición del usuario para su visualización en React y descarga la hoja de ruta en formato PDF.

La base de datos SQL Server cumple un papel central en este flujo, actuando como el repositorio principal de toda la información del aplicativo. Cada interacción con el usuario genera inserciones, actualizaciones o consultas que son gestionadas por los modelos de Laravel. Los datos almacenados incluyen información de registro, autenticación, resultados de evaluaciones, configuraciones administrativas y bitácoras de actividad. Esto permite que tanto las organizaciones como el administrador puedan acceder de manera dinámica a la información desde la interfaz web, manteniendo la integridad, seguridad y trazabilidad de los datos en todo momento.

En conjunto, este flujo garantiza una comunicación eficiente entre todas las capas del sistema: React capta la interacción del usuario, Laravel gestiona la lógica y las validaciones, los servicios externos amplían las capacidades del aplicativo mediante automatización y seguridad, y SQL Server asegura el almacenamiento estructurado y confiable de la información generada durante todo el ciclo de uso del sistema

#### Diagrama de La Arquitectura:



