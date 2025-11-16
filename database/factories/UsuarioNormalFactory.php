<?php

namespace Database\Factories;

use Database\Models\UsuarioInterface;
use Database\Models\UsuarioNormal;
use Illuminate\Support\Facades\Hash;

/**
 * Factory concreta para crear usuarios normales
 * Patrón Factory Method - Creator Concreto
 */
class UsuarioNormalFactory extends UsuarioFactory
{
    /**
     * Crea una instancia de UsuarioNormal
     *
     * @param array $datos
     * @return UsuarioInterface
     */
    public function crearUsuario(array $datos): UsuarioInterface
    {
        // Preparar datos
        $datosPreparados = $this->prepararDatos($datos);
        
        // Hashear la contraseña si se proporciona
        if (isset($datos['contrasena']) && !empty($datos['contrasena'])) {
            $datosPreparados['contrasenaHash'] = Hash::make($datos['contrasena']);
        } elseif (isset($datos['contrasenaHash'])) {
            $datosPreparados['contrasenaHash'] = $datos['contrasenaHash'];
        }
        
        // Asegurar que el rol sea 'usuario'
        $datosPreparados['rol'] = 'usuario';
        
        return new UsuarioNormal($datosPreparados);
    }
}

