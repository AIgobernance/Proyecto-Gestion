<?php
/**
 * Inicializador de base de datos PostgreSQL/Neon para Laravel.
 * Ejecuta el esquema correcto (schema_pgsql.sql) en la conexión activa de pgsql.
 */

require __DIR__ . '/../vendor/autoload.php';
$app = require __DIR__ . '/../bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

echo "Iniciando migración de esquema compatible con PostgreSQL/Neon...\n";

try {
    $driver = DB::connection()->getDriverName();
    if ($driver !== 'pgsql') {
        echo "ERROR: La conexión de base de datos activa no es 'pgsql'. Es '$driver'.\n";
        echo "Por favor verifica que DB_CONNECTION=pgsql en tu archivo .env\n";
        exit(1);
    }
    
    $schemaPath = __DIR__ . '/../database/sql/schema_pgsql.sql';
    if (!file_exists($schemaPath)) {
        echo "ERROR: No se encontró el archivo de esquema: $schemaPath\n";
        exit(1);
    }

    echo "Conexión a base de datos PostgreSQL verificada correctamente.\n";
    echo "Leyendo e importando esquema desde: database/sql/schema_pgsql.sql...\n";
    
    $sql = file_get_contents($schemaPath);
    
    // Ejecutar las sentencias SQL
    DB::unprepared($sql);
    
    echo "\n[OK] Esquema de base de datos creado exitosamente en PostgreSQL (Neon)!\n";
    exit(0);
} catch (\Exception $e) {
    echo "\nERROR durante la instalación de la base de datos:\n";
    echo $e->getMessage() . "\n";
    exit(1);
}
