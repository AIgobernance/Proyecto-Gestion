<?php

namespace Database\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Database\Factories\UsuarioFactoryManager;

class UsuarioRepository
{
    /**
     * Nombre de la tabla en la base de datos
     */
    protected string $table = 'usuario';
    
    /**
     * Cache para verificación de columna FechaCrea
     */
    protected static ?bool $tieneFechaCreacionCache = null;

    /**
     * Verifica si un correo ya existe en la base de datos
     *
     * @param string $correo
     * @return bool
     */
    public function existeCorreo(string $correo): bool
    {
        // Optimización: usar exists() en lugar de first() para mejor rendimiento
        return DB::table($this->table)
            ->where('Correo', $correo)
            ->exists();
    }

    /**
     * Verifica si ya existe un usuario con el mismo tipo y número de documento
     *
     * @param string $tipoDocumento
     * @param string $numeroDocumento
     * @return bool
     */
    public function existeDocumento(string $tipoDocumento, string $numeroDocumento): bool
    {
        // Optimización: usar exists() en lugar de first() para mejor rendimiento
        return DB::table($this->table)
            ->where('Tipo_Documento', $tipoDocumento)
            ->where('Numero_Documento', $numeroDocumento)
            ->exists();
    }

    /**
     * Crea un nuevo usuario en la base de datos usando el Factory Method
     *
     * @param array $datos
     * @return int ID del usuario creado
     * @throws \Exception
     */
    public function crear(array $datos): int
    {
        try {
            // Determinar el tipo de usuario (usuario o admin)
            $tipoUsuario = $datos['rol'] ?? 'usuario';
            
            // Usar Factory Method para crear la instancia del usuario
            $usuario = UsuarioFactoryManager::crearUsuario($datos, $tipoUsuario);
            
            // Obtener los datos preparados para la BD desde el objeto usuario
            $datosInsert = $usuario->getDatosParaBD();
            
            // El constraint CK_usuario_Activate_TrueFalse puede requerir valores específicos
            // Intentar diferentes formatos: 'True'/'False' (strings), 1/0 (bit), etc.
            $activateValue = isset($datos['activate']) ? $datos['activate'] : 'True';

            // Para SQL Server, usar SQL directo para manejar constraints y tipos de dato correctamente
            // El constraint CK_usuario_Activate_TrueFalse puede requerir valores específicos
            // Intentar diferentes formatos: 'True'/'False' (strings), 1/0 (bit), etc.
            $activateAttempts = [
                'True',   // String 'True'
                'False',  // String 'False'
                1,        // Bit 1
                0,        // Bit 0
                true,     // Booleano true
                false     // Booleano false
            ];
            
            $lastError = null;
            
            // Verificar si la columna FechaCrea existe (usar cache estático)
            if (self::$tieneFechaCreacionCache === null) {
                try {
                    $columnaExiste = DB::selectOne("
                        SELECT COUNT(*) as existe 
                        FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_NAME = ? AND COLUMN_NAME = 'FechaCrea'
                    ", [$this->table]);
                    self::$tieneFechaCreacionCache = ($columnaExiste && $columnaExiste->existe > 0);
                } catch (\Exception $e) {
                    // Si no se puede verificar, asumir que no existe
                    self::$tieneFechaCreacionCache = false;
                    Log::warning('No se pudo verificar si existe la columna FechaCrea', [
                        'error' => $e->getMessage()
                    ]);
                }
            }
            $tieneFechaCreacion = self::$tieneFechaCreacionCache;
            
            foreach ($activateAttempts as $activateAttempt) {
                try {
                    // Construir la consulta SQL directa
                    // Incluir FechaCrea solo si la columna existe
                    if ($tieneFechaCreacion) {
                        $sql = "INSERT INTO [{$this->table}] 
                                ([Nombre_Usuario], [Empresa], [NIT], [Tipo_Documento], [Numero_Documento], 
                                 [Sector], [Pais], [Correo], [Telefono], [Contrasena], [Rol], [Activate], [FechaCrea]) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, GETDATE())";
                    } else {
                        $sql = "INSERT INTO [{$this->table}] 
                                ([Nombre_Usuario], [Empresa], [NIT], [Tipo_Documento], [Numero_Documento], 
                                 [Sector], [Pais], [Correo], [Telefono], [Contrasena], [Rol], [Activate]) 
                                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    }
                    
                    $params = [
                        $datosInsert['Nombre_Usuario'],
                        $datosInsert['Empresa'],
                        $datosInsert['NIT'],
                        $datosInsert['Tipo_Documento'],
                        $datosInsert['Numero_Documento'],
                        $datosInsert['Sector'],
                        $datosInsert['Pais'],
                        $datosInsert['Correo'],
                        $datosInsert['Telefono'],
                        $datosInsert['Contrasena'], // La contraseña ya viene hasheada del objeto usuario
                        $datosInsert['Rol'],
                        $activateAttempt
                    ];
                
                    DB::insert($sql, $params);
                    
                    // Obtener el último ID insertado
                    $id = DB::selectOne("SELECT SCOPE_IDENTITY() as Id");
                    
                    if ($id && isset($id->Id)) {
                        Log::info('Usuario creado exitosamente con valor Activate', [
                            'activate_value' => $activateAttempt,
                            'user_id' => $id->Id
                        ]);
                        return (int) $id->Id;
                    }
                    
                    // Si no funciona SCOPE_IDENTITY, intentar obtener por correo
                    $usuario = $this->obtenerPorCorreo($datos['correo']);
                    if ($usuario && isset($usuario->Id)) {
                        return (int) $usuario->Id;
                    }
                    
                    throw new \Exception('No se pudo obtener el ID del usuario insertado.');
                    
                } catch (\Exception $e) {
                    $lastError = $e;
                    
                    // Si es un error de constraint, continuar con el siguiente intento
                    if (strpos($e->getMessage(), 'CHECK constraint') !== false) {
                        Log::warning('Intento fallido con valor Activate', [
                            'activate_value' => $activateAttempt,
                            'error' => $e->getMessage()
                        ]);
                        continue; // Intentar con el siguiente valor
                    }
                    
                    // Si es otro tipo de error, relanzarlo inmediatamente
                    throw $e;
                }
            }
            
            // Si todos los intentos fallaron, lanzar el último error
            if ($lastError) {
                Log::error('Todos los intentos de insertar usuario fallaron por constraint', [
                    'last_error' => $lastError->getMessage()
                ]);
                throw new \Exception('No se pudo insertar el usuario. El constraint CK_usuario_Activate_TrueFalse rechazó todos los valores intentados. Último error: ' . $lastError->getMessage());
            }
        } catch (\Exception $e) {
            Log::error('Error en UsuarioRepository::crear', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'datos' => array_merge($datos, ['contrasena' => '***'])
            ]);
            throw $e;
        }
    }

    /**
     * Obtiene un usuario por su ID
     *
     * @param int $id
     * @return object|null
     */
    public function obtenerPorId(int $id): ?object
    {
        // Optimización: seleccionar solo los campos necesarios
        return DB::table($this->table)
            ->select([
                'Id', 'Nombre_Usuario', 'Correo', 'Contrasena', 'Rol', 'Activate',
                'Empresa', 'NIT', 'Tipo_Documento', 'Numero_Documento',
                'Sector', 'Pais', 'Telefono', 'Foto_Perfil'
            ])
            ->where('Id', $id)
            ->first();
    }

    /**
     * Obtiene un usuario por su correo
     *
     * @param string $correo
     * @return object|null
     */
    public function obtenerPorCorreo(string $correo): ?object
    {
        // Optimización: seleccionar solo los campos necesarios
        return DB::table($this->table)
            ->select([
                'Id', 'Nombre_Usuario', 'Correo', 'Contrasena', 'Rol', 'Activate',
                'Empresa', 'NIT', 'Tipo_Documento', 'Numero_Documento',
                'Sector', 'Pais', 'Telefono', 'Foto_Perfil'
            ])
            ->where('Correo', $correo)
            ->first();
    }

    /**
     * Obtiene un usuario por su nombre de usuario
     *
     * @param string $nombreUsuario
     * @return object|null
     */
    public function obtenerPorNombreUsuario(string $nombreUsuario): ?object
    {
        // Optimización: seleccionar solo los campos necesarios
        return DB::table($this->table)
            ->select([
                'Id', 'Nombre_Usuario', 'Correo', 'Contrasena', 'Rol', 'Activate',
                'Empresa', 'NIT', 'Tipo_Documento', 'Numero_Documento',
                'Sector', 'Pais', 'Telefono', 'Foto_Perfil'
            ])
            ->where('Nombre_Usuario', $nombreUsuario)
            ->first();
    }

    /**
     * Autentica un usuario por correo o nombre de usuario y contraseña usando Factory Method
     *
     * @param string $identificador Correo o nombre de usuario
     * @param string $contrasena Contraseña sin hashear
     * @param object|null $usuarioBD Usuario ya obtenido (para evitar consultas duplicadas)
     * @return UsuarioInterface|null Usuario si las credenciales son correctas, null si no
     */
    public function autenticar(string $identificador, string $contrasena, ?object $usuarioBD = null): ?UsuarioInterface
    {
        // Si no se proporciona el usuario, buscarlo
        if (!$usuarioBD) {
            // Optimización: buscar por correo o nombre en una sola consulta usando OR
            $usuarioBD = DB::table($this->table)
                ->select([
                    'Id', 'Nombre_Usuario', 'Correo', 'Contrasena', 'Rol', 'Activate',
                    'Empresa', 'NIT', 'Tipo_Documento', 'Numero_Documento',
                    'Sector', 'Pais', 'Telefono', 'Foto_Perfil'
                ])
                ->where(function($query) use ($identificador) {
                    $query->where('Correo', $identificador)
                          ->orWhere('Nombre_Usuario', $identificador);
                })
                ->first();
        }
        
        // Si no se encuentra el usuario, retornar null
        if (!$usuarioBD) {
            return null;
        }
        
        // Determinar el tipo de usuario según el rol en la BD
        $rol = $usuarioBD->Rol ?? 'usuario';
        
        // Convertir el objeto de BD a array para crear el usuario con Factory
        // Asegurar que el ID esté presente (puede estar en Id o id)
        $userId = $usuarioBD->Id ?? $usuarioBD->id ?? null;
        
        if ($userId === null) {
            Log::error('Usuario encontrado en BD pero sin ID', [
                'correo' => $usuarioBD->Correo ?? 'NO_CORREO',
                'nombre' => $usuarioBD->Nombre_Usuario ?? 'NO_NOMBRE'
            ]);
        }
        
        $datosUsuario = [
            'id' => $userId,
            'usuario' => $usuarioBD->Nombre_Usuario,
            'nombre' => $usuarioBD->Nombre_Usuario,
            'correo' => $usuarioBD->Correo,
            'empresa' => $usuarioBD->Empresa ?? '',
            'nit' => $usuarioBD->NIT ?? '',
            'tipoDocumento' => $usuarioBD->Tipo_Documento ?? '',
            'numeroDocumento' => $usuarioBD->Numero_Documento ?? '',
            'sector' => $usuarioBD->Sector ?? '',
            'pais' => $usuarioBD->Pais ?? '',
            'telefono' => $usuarioBD->Telefono ?? '',
            'contrasenaHash' => $usuarioBD->Contrasena,
            'rol' => $rol,
            'activate' => is_string($usuarioBD->Activate ?? 1) ? (int)$usuarioBD->Activate : (int)($usuarioBD->Activate ?? 1),
        ];
        
        Log::info('Datos del usuario preparados para Factory', [
            'id' => $userId,
            'correo' => $datosUsuario['correo'],
            'rol' => $rol
        ]);
        
        // Verificar si el usuario está activo antes de autenticar
        // El campo Activate puede ser: 'True'/'False' (string), 1/0 (int), true/false (bool)
        $activateValue = $usuarioBD->Activate ?? 1;
        
        // Normalizar el valor para determinar si está activo
        $isActive = false;
        if (is_string($activateValue)) {
            // Si es string, verificar si es 'True' (case-insensitive)
            $isActive = (strtolower(trim($activateValue)) === 'true' || $activateValue === '1');
        } elseif (is_bool($activateValue)) {
            $isActive = $activateValue;
        } elseif (is_numeric($activateValue)) {
            $isActive = ((int)$activateValue == 1);
        }
        
        Log::info('Verificación de estado Activate', [
            'correo' => $usuarioBD->Correo ?? 'NO_CORREO',
            'activate_raw' => $activateValue,
            'activate_type' => gettype($activateValue),
            'isActive' => $isActive
        ]);
        
        if (!$isActive) {
            Log::warning('Intento de login de usuario desactivado', [
                'correo' => $usuarioBD->Correo ?? 'NO_CORREO',
                'nombre' => $usuarioBD->Nombre_Usuario ?? 'NO_NOMBRE',
                'activate_raw' => $activateValue,
                'activate_type' => gettype($activateValue)
            ]);
            // Retornar null para indicar que el usuario está desactivado
            // El LoginController manejará este caso específicamente
            return null;
        }
        
        // Crear instancia del usuario usando Factory Method
        $usuario = UsuarioFactoryManager::crearUsuario($datosUsuario, $rol);
        
        // Verificar la contraseña usando el método autenticar del objeto usuario
        if ($usuario->autenticar($contrasena)) {
            return $usuario;
        }
        
        return null;
    }

    /**
     * Actualiza un usuario
     *
     * @param int $id
     * @param array $datos
     * @return bool
     */
    public function actualizar(int $id, array $datos): bool
    {
        // Filtrar solo los campos que existen en la BD
        $camposPermitidos = [
            'Nombre_Usuario',
            'Empresa',
            'NIT',
            'Tipo_Documento',
            'Numero_Documento',
            'Sector',
            'Pais',
            'Correo',
            'Telefono',
            'Rol',
            'Activate',
            'Foto_Perfil', // Agregar soporte para foto de perfil
            'Fecha_Actualizacion', // Fecha de actualización de datos
            'Fecha_Ultima_Conexion' // Fecha de última conexión
        ];

        $datosActualizar = [];
        foreach ($datos as $campo => $valor) {
            if (in_array($campo, $camposPermitidos)) {
                $datosActualizar[$campo] = $valor;
            }
        }

        // Si se actualiza la contraseña, hashearla
        if (isset($datos['contrasena'])) {
            $datosActualizar['Contrasena'] = Hash::make($datos['contrasena']);
            Log::info('Contraseña hasheada para actualización', ['usuario_id' => $id]);
        }

        // Si no se está actualizando explícitamente Fecha_Actualizacion, agregarla automáticamente
        // Solo si hay otros campos que actualizar (no solo fechas)
        if (!isset($datosActualizar['Fecha_Actualizacion']) && !empty($datosActualizar)) {
            // Verificar que no sea solo una actualización de fecha de conexión
            $camposSinFechas = array_diff(array_keys($datosActualizar), ['Fecha_Ultima_Conexion', 'Fecha_Actualizacion']);
            if (!empty($camposSinFechas)) {
                $datosActualizar['Fecha_Actualizacion'] = now();
            }
        }

        if (empty($datosActualizar)) {
            Log::warning('No hay datos para actualizar', ['usuario_id' => $id, 'datos_recibidos' => array_keys($datos)]);
            return false;
        }

        try {
            // Si se está actualizando el campo Activate, usar SQL directo para manejar el constraint
            if (isset($datosActualizar['Activate'])) {
                $activateValue = $datosActualizar['Activate'];
                unset($datosActualizar['Activate']); // Remover de datosActualizar para manejarlo por separado
                
                // Intentar diferentes formatos para el constraint CK_usuario_Activate_TrueFalse
                $activateAttempts = [
                    'True',   // String 'True'
                    'False',  // String 'False'
                    1,        // Bit 1
                    0,        // Bit 0
                    true,     // Booleano true
                    false     // Booleano false
                ];
                
                // Determinar qué valor intentar basado en el valor deseado
                $targetValue = ($activateValue == 1 || $activateValue === 'True' || $activateValue === true || $activateValue === '1');
                // Intentar todos los valores posibles, empezando por los más probables
                $attemptsToTry = $targetValue 
                    ? ['True', 1, true, '1'] 
                    : ['False', 0, false, '0'];
                
                $lastError = null;
                $activateUpdated = false;
                
                foreach ($attemptsToTry as $activateAttempt) {
                    try {
                        // Construir la consulta SQL para actualizar Activate
                        $sql = "UPDATE [{$this->table}] SET [Activate] = ? WHERE [Id] = ?";
                        $params = [$activateAttempt, $id];
                        
                        DB::update($sql, $params);
                        
                        Log::info('Campo Activate actualizado exitosamente', [
                            'usuario_id' => $id,
                            'activate_value' => $activateAttempt,
                            'target_value' => $targetValue
                        ]);
                        
                        $activateUpdated = true;
                        break; // Salir del loop si funcionó
                        
                    } catch (\Exception $e) {
                        $lastError = $e;
                        
                        // Si es un error de constraint, continuar con el siguiente intento
                        if (strpos($e->getMessage(), 'CHECK constraint') !== false) {
                            Log::warning('Intento fallido al actualizar Activate', [
                                'activate_value' => $activateAttempt,
                                'error' => $e->getMessage()
                            ]);
                            continue; // Intentar con el siguiente valor
                        }
                        
                        // Si es otro tipo de error, relanzarlo inmediatamente
                        throw $e;
                    }
                }
                
                // Si no se pudo actualizar Activate, lanzar error
                if (!$activateUpdated && $lastError) {
                    Log::error('No se pudo actualizar Activate después de todos los intentos', [
                        'usuario_id' => $id,
                        'last_error' => $lastError->getMessage()
                    ]);
                    throw new \Exception('No se pudo actualizar el estado del usuario. El constraint CK_usuario_Activate_TrueFalse rechazó todos los valores intentados. Último error: ' . $lastError->getMessage());
                }
            }
            
            // Actualizar los demás campos si hay alguno
            if (!empty($datosActualizar)) {
                // Si hay campos de fecha, usar SQL directo para usar GETDATE() de SQL Server
                $tieneFechas = isset($datosActualizar['Fecha_Actualizacion']) || isset($datosActualizar['Fecha_Ultima_Conexion']);
                
                if ($tieneFechas) {
                    // Construir la consulta SQL con GETDATE() para las fechas
                    $setParts = [];
                    $params = [];
                    
                    foreach ($datosActualizar as $campo => $valor) {
                        if ($campo === 'Fecha_Actualizacion' || $campo === 'Fecha_Ultima_Conexion') {
                            $setParts[] = "[{$campo}] = GETDATE()";
                        } else {
                            $setParts[] = "[{$campo}] = ?";
                            $params[] = $valor;
                        }
                    }
                    
                    $params[] = $id; // Para el WHERE
                    $sql = "UPDATE [{$this->table}] SET " . implode(', ', $setParts) . " WHERE [Id] = ?";
                    
                    $filasAfectadas = DB::update($sql, $params);
                } else {
                    // Usar el método normal de Laravel para campos sin fechas
                    $filasAfectadas = DB::table($this->table)
                        ->where('Id', $id)
                        ->update($datosActualizar);
                }
                
                Log::info('Campos adicionales actualizados', [
                    'usuario_id' => $id,
                    'filas_afectadas' => $filasAfectadas,
                    'campos_actualizados' => array_keys($datosActualizar)
                ]);
            }
            
            Log::info('Actualización de usuario ejecutada exitosamente', [
                'usuario_id' => $id,
                'campos_actualizados' => array_merge(
                    isset($datos['Activate']) ? ['Activate'] : [],
                    array_keys($datosActualizar)
                )
            ]);
            
            return true;
            
        } catch (\Exception $e) {
            Log::error('Error al actualizar usuario en BD', [
                'usuario_id' => $id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            throw $e;
        }
    }

    /**
     * Activa un usuario (cambia Activate a 1)
     *
     * @param int $id
     * @return bool
     */
    public function activar(int $id): bool
    {
        return DB::table($this->table)
            ->where('Id', $id)
            ->update(['Activate' => 1]) > 0;
    }

    /**
     * Obtiene todos los usuarios (con paginación opcional)
     *
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function obtenerTodos(int $limit = 100, int $offset = 0): array
    {
        // Optimización: seleccionar solo los campos necesarios para la lista
        return DB::table($this->table)
            ->select([
                'Id', 'Nombre_Usuario', 'Correo', 'Rol', 'Activate', 
                'Empresa', 'Foto_Perfil'
            ])
            ->orderBy('Id', 'desc') // Ordenar por ID descendente para mostrar los más recientes primero
            ->skip($offset)
            ->take($limit)
            ->get()
            ->toArray();
    }
}

