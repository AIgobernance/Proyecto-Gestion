<?php

namespace Database\Models;

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class UsuarioRepository
{
    /**
     * Nombre de la tabla en la base de datos
     */
    protected string $table = 'usuario';

    /**
     * Verifica si un correo ya existe en la base de datos
     *
     * @param string $correo
     * @return bool
     */
    public function existeCorreo(string $correo): bool
    {
        $result = DB::table($this->table)
            ->where('Correo', $correo)
            ->first();

        return $result !== null;
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
        $result = DB::table($this->table)
            ->where('Tipo_Documento', $tipoDocumento)
            ->where('Numero_Documento', $numeroDocumento)
            ->first();

        return $result !== null;
    }

    /**
     * Crea un nuevo usuario en la base de datos
     *
     * @param array $datos
     * @return int ID del usuario creado
     * @throws \Exception
     */
    public function crear(array $datos): int
    {
        try {
            // Hashear la contraseña
            $contrasenaHash = Hash::make($datos['contrasena']);
            
            // Mapear los datos del formulario a los campos de la BD
            // Nota: El constraint CK_usuario_Activate_TrueFalse puede requerir valores específicos
            // El constraint podría aceptar: 'True'/'False' (strings), 1/0 (bit), o valores específicos
            // Intentar primero con el valor que viene en los datos, o usar 'True' por defecto
            $activateValue = isset($datos['activate']) ? $datos['activate'] : 'True';
            
            $datosInsert = [
                'Nombre_Usuario' => $datos['usuario'],
                'Empresa' => $datos['empresa'],
                'NIT' => $datos['nit'],
                'Tipo_Documento' => $datos['tipoDocumento'],
                'Numero_Documento' => $datos['numeroDocumento'],
                'Sector' => $datos['sector'],
                'Pais' => $datos['pais'],
                'Correo' => $datos['correo'],
                'Telefono' => $datos['telefono'],
                'Rol' => $datos['rol'] ?? 'usuario', // Por defecto 'usuario', puede ser 'admin'
                // Activate se manejará en el SQL directo debido al constraint
            ];

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
            
            foreach ($activateAttempts as $activateAttempt) {
                try {
                    // Construir la consulta SQL directa
                    $sql = "INSERT INTO [{$this->table}] 
                            ([Nombre_Usuario], [Empresa], [NIT], [Tipo_Documento], [Numero_Documento], 
                             [Sector], [Pais], [Correo], [Telefono], [Contrasena], [Rol], [Activate]) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                    
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
                        $contrasenaHash,
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
        return DB::table($this->table)
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
        return DB::table($this->table)
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
        return DB::table($this->table)
            ->where('Nombre_Usuario', $nombreUsuario)
            ->first();
    }

    /**
     * Autentica un usuario por correo o nombre de usuario y contraseña
     *
     * @param string $identificador Correo o nombre de usuario
     * @param string $contrasena Contraseña sin hashear
     * @return object|null Usuario si las credenciales son correctas, null si no
     */
    public function autenticar(string $identificador, string $contrasena): ?object
    {
        // Intentar buscar por correo primero
        $usuario = $this->obtenerPorCorreo($identificador);
        
        // Si no se encuentra por correo, intentar por nombre de usuario
        if (!$usuario) {
            $usuario = $this->obtenerPorNombreUsuario($identificador);
        }
        
        // Si no se encuentra el usuario, retornar null
        if (!$usuario) {
            return null;
        }
        
        // Verificar la contraseña
        if (Hash::check($contrasena, $usuario->Contrasena)) {
            // Ocultar la contraseña antes de retornar
            unset($usuario->Contrasena);
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
            'Activate'
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
        }

        if (empty($datosActualizar)) {
            return false;
        }

        return DB::table($this->table)
            ->where('Id', $id)
            ->update($datosActualizar) > 0;
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
        return DB::table($this->table)
            ->skip($offset)
            ->take($limit)
            ->get()
            ->toArray();
    }
}

