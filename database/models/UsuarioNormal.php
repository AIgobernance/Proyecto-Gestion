<?php

namespace Database\Models;

use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

/**
 * Clase concreta que representa un Usuario Normal
 * Patrón Factory Method - Producto Concreto
 */
class UsuarioNormal implements UsuarioInterface
{
    protected ?int $id;
    protected string $nombre;
    protected string $correo;
    protected string $contrasenaHash;
    protected string $empresa;
    protected string $nit;
    protected string $tipoDocumento;
    protected string $numeroDocumento;
    protected string $sector;
    protected string $pais;
    protected string $telefono;
    protected string $rol = 'usuario';
    protected int $activate = 1;

    public function __construct(array $datos)
    {
        $this->id = $datos['id'] ?? null;
        $this->nombre = $datos['usuario'] ?? $datos['nombre'] ?? '';
        $this->correo = $datos['correo'] ?? '';
        $this->contrasenaHash = $datos['contrasenaHash'] ?? '';
        $this->empresa = $datos['empresa'] ?? '';
        $this->nit = $datos['nit'] ?? '';
        $this->tipoDocumento = $datos['tipoDocumento'] ?? '';
        $this->numeroDocumento = $datos['numeroDocumento'] ?? '';
        $this->sector = $datos['sector'] ?? '';
        $this->pais = $datos['pais'] ?? '';
        $this->telefono = $datos['telefono'] ?? '';
        $this->rol = 'usuario';
        // Asegurar que activate sea siempre un int
        $this->activate = isset($datos['activate']) ? (int)$datos['activate'] : 1;
    }

    public function getRol(): string
    {
        return $this->rol;
    }

    public function getNombre(): string
    {
        return $this->nombre;
    }

    public function getCorreo(): string
    {
        return $this->correo;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function autenticar(string $password): bool
    {
        if (empty($this->contrasenaHash)) {
            return false;
        }
        return Hash::check($password, $this->contrasenaHash);
    }

    public function cerrarSesion(): void
    {
        // Lógica específica para cerrar sesión de usuario normal
        Log::info('Usuario normal cerrando sesión', ['usuario_id' => $this->id]);
        // Aquí se puede agregar lógica adicional como limpiar tokens, etc.
    }

    public function recuperarContrasena(string $nuevaContrasena): bool
    {
        // Lógica específica para recuperar contraseña de usuario normal
        Log::info('Usuario normal recuperando contraseña', ['usuario_id' => $this->id]);
        // Aquí se implementaría la lógica de actualización de contraseña
        return true;
    }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'nombre' => $this->nombre,
            'correo' => $this->correo,
            'rol' => $this->rol,
            'empresa' => $this->empresa,
            'nit' => $this->nit,
            'tipoDocumento' => $this->tipoDocumento,
            'numeroDocumento' => $this->numeroDocumento,
            'sector' => $this->sector,
            'pais' => $this->pais,
            'telefono' => $this->telefono,
        ];
    }

    /**
     * Obtiene todos los datos del usuario para inserción en BD
     *
     * @return array
     */
    public function getDatosParaBD(): array
    {
        return [
            'Nombre_Usuario' => $this->nombre,
            'Empresa' => $this->empresa,
            'NIT' => $this->nit,
            'Tipo_Documento' => $this->tipoDocumento,
            'Numero_Documento' => $this->numeroDocumento,
            'Sector' => $this->sector,
            'Pais' => $this->pais,
            'Correo' => $this->correo,
            'Telefono' => $this->telefono,
            'Contrasena' => $this->contrasenaHash,
            'Rol' => $this->rol,
            'Activate' => $this->activate,
        ];
    }
}

