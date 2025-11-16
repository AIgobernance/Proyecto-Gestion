<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Repositories\UserRepository;
use Illuminate\Support\Facades\Hash;

class RegisterController extends Controller
{
    protected $users;

    public function __construct(UserRepository $users)
    {
        $this->users = $users;
    }

    public function register(Request $request)
    {
        $request->validate([
            'usuario' => 'required|string',
            'empresa' => 'required|string',
            'nit' => 'required|string',
            'tipoDocumento' => 'required|string',
            'numeroDocumento' => 'required|string',
            'sector' => 'required|string',
            'pais' => 'required|string',
            'tamanoOrganizacional' => 'required|string',
            'correo' => 'required|email|unique:users,email',
            'telefono' => 'required|string',
            'contrasena' => 'required|min:8',
        ]);

        $userData = [
            'name' => $request->usuario,
            'email' => $request->correo,
            'password' => Hash::make($request->contrasena),
            'empresa' => $request->empresa,
            'nit' => $request->nit,
            'tipo_documento' => $request->tipoDocumento,
            'numero_documento' => $request->numeroDocumento,
            'sector' => $request->sector,
            'pais' => $request->pais,
            'tamano' => $request->tamanoOrganizacional,
            'telefono' => $request->telefono,
        ];

        $user = $this->users->createUser($userData);

        return response()->json([
            'message' => 'Usuario registrado correctamente',
            'user' => $user
        ], 201);
    }
}
