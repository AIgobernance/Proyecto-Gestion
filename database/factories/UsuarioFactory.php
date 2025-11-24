<?php

namespace Database\Factories;

use Database\Models\UsuarioInterface;

/**
 * Clase Factory abstracta que define el método factory
 * Patrón Factory Method - Creator Abstracto
 */
abstract class UsuarioFactory
{
    /**
     * Método factory que crea instancias de usuarios
     * Las subclases deben implementar este método
     *
     * @param array $datos
     * @return UsuarioInterface
     */
    abstract public function crearUsuario(array $datos): UsuarioInterface;

    /**
     * Método helper que prepara los datos antes de crear el usuario
     *
     * @param array $datos
     * @return array
     */
    protected function prepararDatos(array $datos): array
    {
        // Preparar datos comunes para todos los tipos de usuarios
        return [
            'usuario' => $datos['usuario'] ?? '',
            'nombre' => $datos['nombre'] ?? $datos['usuario'] ?? '',
            'correo' => $datos['correo'] ?? '',
            'empresa' => $datos['empresa'] ?? '',
            'nit' => $datos['nit'] ?? '',
            'tipoDocumento' => $datos['tipoDocumento'] ?? '',
            'numeroDocumento' => $datos['numeroDocumento'] ?? '',
            'sector' => $datos['sector'] ?? '',
            'pais' => $datos['pais'] ?? '',
            'telefono' => $datos['telefono'] ?? '',
            // Asegurar que activate sea siempre un int
            'activate' => isset($datos['activate']) ? (int)$datos['activate'] : 1,
        ];
    }
}

