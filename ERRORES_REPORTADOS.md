# Lista de Errores Reportados - Resumen General

## 1. Errores de Autenticación y Sesión

### 1.1 CSRF Token Mismatch
- **Descripción**: Error "CSRF token mismatch" al intentar crear una cuenta nueva
- **Causa**: Token CSRF no se estaba enviando correctamente o había expirado
- **Estado**: ✅ Resuelto

### 1.2 Error al Cargar Datos del Perfil
- **Descripción**: "Error al cargar los datos del perfil"
- **Causa**: Problema al obtener datos del usuario desde la sesión
- **Estado**: ✅ Resuelto

### 1.3 ID de Usuario No Encontrado en Sesión
- **Descripción**: "Error: ID de usuario no encontrado en la sesión"
- **Causa**: El ID del usuario no estaba siendo guardado correctamente en la sesión
- **Estado**: ✅ Resuelto

### 1.4 No Se Podía Iniciar Sesión
- **Descripción**: No se podía iniciar sesión incluso si la cuenta no estaba desactivada, y aparecía mensaje de desactivación
- **Causa**: Lógica incorrecta de verificación de estado de cuenta
- **Estado**: ✅ Resuelto

## 2. Errores de Activación de Cuenta y JWT

### 2.1 Activación Automática de Cuenta
- **Descripción**: La cuenta se activaba automáticamente en lugar de quedarse en `activate = 0` (false)
- **Causa**: Problema con la inserción de valores en SQL Server para la columna `Activate`
- **Estado**: ✅ Resuelto

### 2.2 Error en Token JWT al Verificar Email
- **Descripción**: Error al hacer clic en el link de verificación del email
- **Causa**: Problema con la generación/validación del token JWT, posible inconsistencia en la clave secreta
- **Estado**: ✅ Resuelto

### 2.3 RuntimeException: Unsupported Cipher
- **Descripción**: "Unsupported cipher or incorrect key length" después de quitar `JWT_SECRET` del `.env`
- **Causa**: `APP_KEY` no tenía el prefijo `base64:` requerido por Laravel
- **Estado**: ✅ Resuelto

### 2.4 Error Persistente con Token JWT
- **Descripción**: El token seguía dando error después de varios intentos de corrección
- **Causa**: Inconsistencia en cómo se manejaba `APP_KEY` entre generación y validación del token
- **Estado**: ✅ Resuelto

## 3. Errores de Base de Datos

### 3.1 Invalid Column Name 'Tiempo'
- **Descripción**: Error SQL "Invalid column name 'Tiempo'" al consultar la tabla `Evaluacion`
- **Causa**: La columna `Tiempo` no había sido agregada a la tabla
- **Estado**: ✅ Resuelto (se creó script SQL para agregar la columna)

### 3.2 Invalid Column Name 'Estado'
- **Descripción**: Error SQL "Invalid column name 'Estado'" al consultar la tabla `Evaluacion`
- **Causa**: La columna `Estado` no existía en la tabla, pero se estaba usando en las consultas
- **Estado**: ✅ Resuelto (se removieron los filtros por `Estado`)

### 3.3 Invalid Column Name 'Fecha_Creacion'
- **Descripción**: Error al consultar `Fecha_Creacion` en la tabla `usuario`
- **Causa**: La columna se llama `FechaCrea` (sin guión bajo), no `Fecha_Creacion`
- **Estado**: ✅ Resuelto (se actualizaron todas las referencias)

### 3.4 SQL: The Active Result Contains No Fields
- **Descripción**: Error al crear evaluación: "The active result for the query contains no fields"
- **Causa**: SQL Server no permite `SELECT SCOPE_IDENTITY()` encadenado con `INSERT` en una sola llamada
- **Estado**: ✅ Resuelto (se usó `OUTPUT INSERTED.Id_Evaluacion`)

### 3.5 Incorrect Syntax Near Keyword 'user'
- **Descripción**: Error SQL "Incorrect syntax near the keyword 'user'"
- **Causa**: `user` es una palabra reservada en SQL Server, necesitaba ser escapada como `[user]`
- **Estado**: ✅ Resuelto (se cambió el alias)

### 3.6 Id_Pregunta Incorrecto en Respuestas
- **Descripción**: El `Id_Pregunta` almacenado en `Respuestas` era incorrecto (índices 0-based en lugar de 1-based)
- **Causa**: El frontend enviaba índices 0-based pero la BD esperaba números de pregunta 1-based
- **Estado**: ✅ Resuelto (se transformó el array antes de guardar)

## 4. Errores de Frontend/UI

### 4.1 Pantalla Negra Después de Login
- **Descripción**: La pantalla se quedaba negra después del login
- **Causa**: Problema con el routing o el componente que se mostraba
- **Estado**: ✅ Resuelto

### 4.2 Pantalla Negra Después de Registro
- **Descripción**: La pantalla se quedaba negra después del registro
- **Causa**: Similar al anterior, problema de routing
- **Estado**: ✅ Resuelto

### 4.3 Error JSX: Expected Corresponding Closing Tag
- **Descripción**: Error de sintaxis JSX en `GeneralDashboardPage.jsx`
- **Causa**: Etiqueta de cierre faltante o extra después de remover código
- **Estado**: ✅ Resuelto

### 4.4 Modal "Feo" para Cambiar Foto de Perfil
- **Descripción**: Aparecía un modal no deseado al cambiar foto de perfil en `UserManagementPage.jsx`
- **Causa**: Se estaba usando un modal diferente al esperado
- **Estado**: ✅ Resuelto (se cambió a usar `ChangePhotoModal.jsx`)

### 4.5 Modal Permanece Abierto al Cambiar de Tab
- **Descripción**: El modal de cambio de foto permanecía abierto al cambiar de "User List" a "Create User"
- **Causa**: El estado del modal no se limpiaba al cambiar de tab
- **Estado**: ✅ Resuelto

### 4.6 Modal de Éxito No Coincide con Estilo
- **Descripción**: El modal de éxito al crear usuario no coincidía con el estilo de otros modales
- **Causa**: Estilos diferentes aplicados
- **Estado**: ✅ Resuelto

### 4.7 Modal de Actualización de Contraseña No Coincide
- **Descripción**: El modal al actualizar contraseña de administrador no coincidía con el estilo
- **Causa**: Estilos diferentes aplicados
- **Estado**: ✅ Resuelto

## 5. Errores de Dashboard y Estadísticas

### 5.1 No Se Pudieron Cargar las Estadísticas
- **Descripción**: "No se pudieron cargar las estadísticas" en `GeneralDashboardPage.jsx`
- **Causa**: Errores en las consultas SQL o columnas/tablas faltantes
- **Estado**: ✅ Resuelto (se agregó manejo de errores robusto)

### 5.2 Error 500 Internal Server Error en Dashboard
- **Descripción**: Error 500 al cargar el dashboard general
- **Causa**: Consultas SQL fallando por columnas inexistentes
- **Estado**: ✅ Resuelto

### 5.3 "Sin Datos" en Todos los Gráficos
- **Descripción**: Todos los gráficos mostraban "Sin datos"
- **Causa**: Las consultas no retornaban datos o había errores en las consultas
- **Estado**: ✅ Resuelto

### 5.4 Evaluaciones No Se Actualizaban Después de Eliminar
- **Descripción**: Después de eliminar evaluaciones de la BD, la vista seguía mostrando 5 evaluaciones
- **Causa**: Problema de actualización de caché o de la vista
- **Estado**: ✅ Resuelto

## 6. Errores de Evaluaciones

### 6.1 Pregunta Pendiente Permite Continuar
- **Descripción**: Se permitía continuar aunque hubiera una pregunta pendiente sin responder
- **Causa**: Falta de validación para marcar pregunta como obligatoria
- **Estado**: ✅ Resuelto

### 6.2 Evaluación Completada Aparece como "Continuar"
- **Descripción**: Una evaluación ya completada seguía apareciendo como "evaluación para continuar"
- **Causa**: Lógica incorrecta para determinar si una evaluación está completa
- **Estado**: ✅ Resuelto (luego se removió la funcionalidad de continuar)

### 6.3 Botón "Back to Dashboard" No Funciona
- **Descripción**: Al completar evaluación, el botón "Back to Dashboard" regresaba a la lista de evaluaciones
- **Causa**: Ruta incorrecta en el botón
- **Estado**: ✅ Resuelto

## 7. Errores de Rendimiento

### 7.1 Aplicación Lenta
- **Descripción**: La aplicación se sentía lenta
- **Causa**: Consultas no optimizadas, falta de índices, falta de caché
- **Estado**: ✅ Resuelto (se agregaron índices, caché, y optimizaciones de consultas)

### 7.2 Guardado de Respuestas Muy Lento
- **Descripción**: Guardar respuestas tomaba casi 10 segundos por respuesta
- **Causa**: Consultas ineficientes, posiblemente múltiples consultas por respuesta
- **Estado**: ✅ Resuelto (se optimizó usando MERGE statement)

### 7.3 Creación de Evaluación Lenta
- **Descripción**: La creación de evaluación era lenta, especialmente al pasar la primera respuesta
- **Causa**: Consultas no optimizadas
- **Estado**: ✅ Resuelto

## 8. Errores de Gestión de Usuarios

### 8.1 Error al Cambiar Estado de Usuario
- **Descripción**: "Error al cambiar el estado del usuario" después de unos segundos
- **Causa**: Problema con la actualización optimista o con la petición al backend
- **Estado**: ✅ Resuelto

### 8.2 Desactivación No Se Actualizaba en BD
- **Descripción**: El switch de desactivación no actualizaba la base de datos correctamente
- **Causa**: Problema con la petición o con la actualización en el backend
- **Estado**: ✅ Resuelto

## 9. Errores de Parse/Sintaxis

### 9.1 ParseError: Unclosed '{'
- **Descripción**: Error de sintaxis PHP en `DashboardController.php` línea 141
- **Causa**: Función anónima mal definida (faltaba invocación inmediata)
- **Estado**: ✅ Resuelto (se cambió a IIFE)

## 10. Errores de Verificación de Email

### 10.1 Endpoint Devuelve HTML en Lugar de JSON
- **Descripción**: Al hacer clic en el link de verificación, se recibía HTML en lugar de JSON
- **Causa**: La ruta catch-all estaba capturando `/verify-email` antes que el controlador
- **Estado**: ✅ Resuelto (se ajustó el orden de rutas y se excluyó del catch-all)

### 10.2 El Efecto No Funcionaba
- **Descripción**: El efecto de limpieza de código no funcionaba después de varios intentos
- **Causa**: Problema con el `useEffect` o con las dependencias
- **Estado**: ✅ Resuelto

---

## Resumen por Categoría

- **Autenticación/Sesión**: 4 errores
- **JWT/Activación**: 4 errores
- **Base de Datos**: 6 errores
- **Frontend/UI**: 7 errores
- **Dashboard**: 4 errores
- **Evaluaciones**: 3 errores
- **Rendimiento**: 3 errores
- **Gestión de Usuarios**: 2 errores
- **Parse/Sintaxis**: 1 error
- **Verificación Email**: 2 errores

**Total: 36 errores reportados y resueltos**

