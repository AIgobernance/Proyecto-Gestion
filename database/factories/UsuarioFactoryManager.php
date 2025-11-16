<?php

namespace Database\Factories;

use Database\Models\UsuarioInterface;

/**
 * Manager que determina qué factory usar según el tipo de usuario
 * Facilita la selección de la factory correcta
 */
class UsuarioFactoryManager
{
    /**
     * Obtiene la factory apropiada según el tipo de usuario
     *
     * @param string $tipoUsuario 'usuario' o 'admin'
     * @return UsuarioFactory
     * @throws \InvalidArgumentException
     */
    public static function getFactory(string $tipoUsuario): UsuarioFactory
    {
        return match (strtolower($tipoUsuario)) {
            'usuario', 'user' => new UsuarioNormalFactory(),
            'admin', 'administrador' => new AdministradorFactory(),
            default => throw new \InvalidArgumentException("Tipo de usuario no válido: {$tipoUsuario}"),
        };
    }

    /**
     * Crea un usuario usando la factory apropiada
     *
     * @param array $datos
     * @param string|null $tipoUsuario Si no se especifica, se determina por el rol en los datos
     * @return UsuarioInterface
     */
    public static function crearUsuario(array $datos, ?string $tipoUsuario = null): UsuarioInterface
    {
        // Si no se especifica el tipo, determinarlo por el rol en los datos
        if ($tipoUsuario === null) {
            $tipoUsuario = $datos['rol'] ?? 'usuario';
        }

        $factory = self::getFactory($tipoUsuario);
        return $factory->crearUsuario($datos);
    }
}

