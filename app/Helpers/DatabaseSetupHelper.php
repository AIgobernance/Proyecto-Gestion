<?php

namespace App\Helpers;

use Illuminate\Database\QueryException;

class DatabaseSetupHelper
{
    public const ODBC_DOWNLOAD_URL = 'https://go.microsoft.com/fwlink/?LinkId=163712';

    private static ?bool $odbcDriverCached = null;

    public static function usesSqlServer(): bool
    {
        return config('database.default') === 'sqlsrv';
    }

    public static function isSqlServerDriverError(\Throwable $e): bool
    {
        $message = $e->getMessage();

        if ($e instanceof QueryException && $e->getPrevious()) {
            $message .= ' ' . $e->getPrevious()->getMessage();
        }

        $needles = [
            'IMSSP',
            'ODBC Driver for SQL Server',
            'could not find driver',
            'sqlsrv',
            'pdo_sqlsrv',
            'Microsoft ODBC Driver',
        ];

        foreach ($needles as $needle) {
            if (stripos($message, $needle) !== false) {
                return true;
            }
        }

        return false;
    }

    public static function hasSqlsrvExtension(): bool
    {
        return extension_loaded('sqlsrv') || extension_loaded('pdo_sqlsrv');
    }

    public static function hasOdbcSqlServerDriver(): bool
    {
        if (self::$odbcDriverCached !== null) {
            return self::$odbcDriverCached;
        }

        if (PHP_OS_FAMILY !== 'Windows') {
            return self::$odbcDriverCached = true;
        }

        $command = 'powershell -NoProfile -Command "'
            . '(Get-OdbcDriver -Platform 64-bit | Where-Object { $_.Name -match \'SQL Server\' }).Count"';

        $output = @shell_exec($command);

        if ($output === null || trim($output) === '') {
            return self::$odbcDriverCached = false;
        }

        return self::$odbcDriverCached = ((int) trim($output) > 0);
    }

    public static function missingRequirements(): array
    {
        $missing = [];

        if (!self::usesSqlServer()) {
            return $missing;
        }

        if (!self::hasSqlsrvExtension()) {
            $missing[] = 'extension';
        }

        if (!self::hasOdbcSqlServerDriver()) {
            $missing[] = 'odbc';
        }

        return $missing;
    }

    public static function setupInstructions(): string
    {
        $missing = self::missingRequirements();

        if ($missing === []) {
            return '';
        }

        $lines = [
            'Tu equipo no tiene configurado SQL Server para PHP.',
            '',
        ];

        if (in_array('odbc', $missing, true)) {
            $lines[] = '1. Instala Microsoft ODBC Driver 18 for SQL Server (obligatorio).';
            $lines[] = '   En PowerShell (como administrador), desde la carpeta del proyecto:';
            $lines[] = '   composer run setup:windows';
            $lines[] = '   O descarga: ' . self::ODBC_DOWNLOAD_URL;
            $lines[] = '';
        }

        if (in_array('extension', $missing, true)) {
            $lines[] = '2. Habilita en php.ini las extensiones: sqlsrv y pdo_sqlsrv';
            $lines[] = '   (drivers PHP para SQL Server, misma versión que tu PHP x64).';
            $lines[] = '';
        }

        $lines[] = '3. Reinicia la terminal y vuelve a ejecutar: php artisan serve';

        return implode("\n", $lines);
    }

    public static function friendlyApiPayload(): array
    {
        return [
            'message' => 'Configuración de base de datos incompleta en este equipo',
            'errors' => [
                'general' => [
                    'Falta Microsoft ODBC Driver for SQL Server. Ejecuta en PowerShell (admin): composer run setup:windows',
                ],
            ],
            'setup_required' => true,
            'setup_command' => 'composer run setup:windows',
            'setup_url' => self::ODBC_DOWNLOAD_URL,
            'details' => self::setupInstructions(),
        ];
    }

    /**
     * @return array{ok: bool, missing: list<string>, attempted_install: bool}
     */
    public static function ensureWindowsSqlServerStack(bool $attemptInstall = true): array
    {
        $missing = self::missingRequirements();
        $attempted = false;

        if ($missing === [] || PHP_OS_FAMILY !== 'Windows' || !$attemptInstall) {
            return ['ok' => $missing === [], 'missing' => $missing, 'attempted_install' => false];
        }

        if (in_array('odbc', $missing, true)) {
            $script = base_path('scripts/install-sqlserver-windows.ps1');
            if (is_file($script)) {
                $attempted = true;
                @shell_exec('powershell -NoProfile -ExecutionPolicy Bypass -File "' . $script . '"');
                clearstatcache();
                $missing = self::missingRequirements();
            }
        }

        return ['ok' => $missing === [], 'missing' => $missing, 'attempted_install' => $attempted];
    }
}
