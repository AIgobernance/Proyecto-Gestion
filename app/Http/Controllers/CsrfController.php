<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class CsrfController extends Controller
{
    /**
     * Obtiene el token CSRF actual
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getToken(Request $request)
    {
        return response()->json([
            'token' => csrf_token()
        ]);
    }
}

