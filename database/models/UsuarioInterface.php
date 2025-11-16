<?php

namespace Database\Models;

/**
 * Interfaz que define el contrato común para todos los tipos de usuarios
 * Patrón Factory Method - Producto Abstracto
 */
interface UsuarioInterface
{
    /**
     * Obtiene el rol del usuario
     *
     * @return string
     */
    public function getRol(): string;

    /**
     * Obtiene el nombre del usuario
     *
     * @return string
     */
    public function getNombre(): string;

    /**
     * Obtiene el correo del usuario
     *
     * @return string
     */
    public function getCorreo(): string;

    /**
     * Obtiene el ID del usuario
     *
     * @return int|null
     */
    public function getId(): ?int;

    /**
     * Autentica al usuario
     *
     * @param string $password
     * @return bool
     */
    public function autenticar(string $password): bool;

    /**
     * Cierra la sesión del usuario de forma segura
     *
     * @return void
     */
    public function cerrarSesion(): void;

    /**
     * Permite recuperar la contraseña
     *
     * @param string $nuevaContrasena
     * @return bool
     */
    public function recuperarContrasena(string $nuevaContrasena): bool;

    /**
     * Convierte el usuario a array para respuestas JSON
     *
     * @return array
     */
    public function toArray(): array;
}

