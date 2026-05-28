<?php

/**
 * Comprueba (e intenta instalar en Windows) ODBC + extensiones para SQL Server.
 * Se ejecuta tras composer install para evitar el error IMSSP en el equipo.
 */

$root = dirname(__DIR__);
require $root . '/vendor/autoload.php';

$app = require $root . '/bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Helpers\DatabaseSetupHelper;

if (!DatabaseSetupHelper::usesSqlServer()) {
    exit(0);
}

if (PHP_OS_FAMILY !== 'Windows') {
    exit(0);
}

$result = DatabaseSetupHelper::ensureWindowsSqlServerStack(true);

if ($result['ok']) {
    fwrite(STDOUT, "[OK] SQL Server (ODBC + PHP) listo en este equipo.\n");
    exit(0);
}

fwrite(STDOUT, "\n");
fwrite(STDOUT, "=== ATENCION: falta configuracion SQL Server en Windows ===\n\n");
fwrite(STDOUT, DatabaseSetupHelper::setupInstructions() . "\n\n");

if ($result['attempted_install'] && DatabaseSetupHelper::missingRequirements() === []) {
    fwrite(STDOUT, "[OK] Instalacion automatica completada. Reinicia la terminal.\n");
    exit(0);
}

fwrite(STDOUT, "Ejecuta como administrador: composer run setup:windows\n\n");
exit(0);
