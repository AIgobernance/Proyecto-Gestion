# Arquitectura del Sistema

### Descripción Técnica

El sistema se basa en una arquitectura por capas.

#### Capas:

* Capa de presentación: React, interfaz con la que interactúa el usuario final.
* Capa lógica: Laravel(PHP), controla la lógica del negocio, gestiona la seguridad y coordina la comunicación entre el frontend, la base de datos y los servicios externos..
* Capa de servicios: Proveedor SMTP, proveedor SMS, servicios externos para la utilización de 2FA, N8N, plataforma de automatización.
* Capa de persistencia de datos: SQL Server, base de datos estructurada que almacena toda la información del sistema.

#### Diagrama de la Arquitectura:

<figure><img src=".gitbook/assets/image (2).png" alt=""><figcaption></figcaption></figure>

