<?php

namespace Database\Factories;

use Database\Models\UsuarioInterface;
use Database\Models\Administrador;
use Illuminate\Support\Facades\Hash;

/**
 * Factory concreta para crear administradores
 * Patrón Factory Method - Creator Concreto
 */
class AdministradorFactory extends UsuarioFactory
{
    /**
     * Crea una instancia de Administrador
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
        
        // Asegurar que el rol sea 'admin'
        $datosPreparados['rol'] = 'admin';
        
        return new Administrador($datosPreparados);
    }
}

