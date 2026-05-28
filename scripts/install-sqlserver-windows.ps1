# Instala Microsoft ODBC Driver 18 for SQL Server (requerido por PHP sqlsrv en Windows)
$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "=== Configuracion SQL Server para PHP (Windows) ===" -ForegroundColor Cyan
Write-Host ""

function Test-OdbcSqlServerInstalled {
    try {
        $count = (Get-OdbcDriver -Platform "64-bit" -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -match "SQL Server" }).Count
        return $count -gt 0
    } catch {
        return $false
    }
}

if (Test-OdbcSqlServerInstalled) {
    Write-Host "[OK] ODBC Driver for SQL Server ya esta instalado." -ForegroundColor Green
} else {
    Write-Host "[...] Instalando Microsoft ODBC Driver 18 for SQL Server..." -ForegroundColor Yellow

    $installed = $false

    if (Get-Command winget -ErrorAction SilentlyContinue) {
        Write-Host "      Intentando con winget..." -ForegroundColor Gray
        winget install --id Microsoft.MicrosoftODBCDriver18ForSQLServer -e `
            --accept-source-agreements --accept-package-agreements 2>$null
        if (Test-OdbcSqlServerInstalled) { $installed = $true }
    }

    if (-not $installed) {
        Write-Host "      Descargando instalador oficial..." -ForegroundColor Gray
        $msi = Join-Path $env:TEMP "msodbcsql18.msi"
        try {
            Invoke-WebRequest -Uri "https://go.microsoft.com/fwlink/?linkid=2249004" `
                -OutFile $msi -UseBasicParsing
            Start-Process msiexec.exe -Wait -ArgumentList @(
                "/i", "`"$msi`"",
                "IACCEPTMSODBCSQLLICENSETERMS=YES",
                "ADDLOCAL=ALL",
                "/quiet",
                "/norestart"
            )
            Remove-Item $msi -ErrorAction SilentlyContinue
            if (Test-OdbcSqlServerInstalled) { $installed = $true }
        } catch {
            Write-Host "      Error al descargar/instalar: $_" -ForegroundColor Red
        }
    }

    if ($installed) {
        Write-Host "[OK] ODBC Driver instalado correctamente." -ForegroundColor Green
    } else {
        Write-Host "[!!] No se pudo instalar automaticamente." -ForegroundColor Red
        Write-Host "     Abre PowerShell COMO ADMINISTRADOR y ejecuta de nuevo:" -ForegroundColor Yellow
        Write-Host "     composer run setup:windows" -ForegroundColor White
        Write-Host "     O descarga manual: https://go.microsoft.com/fwlink/?LinkId=163712" -ForegroundColor Yellow
        exit 1
    }
}

# Comprobar extensiones PHP
$php = Get-Command php -ErrorAction SilentlyContinue
if ($php) {
    $ext = php -m 2>$null
    $hasSqlsrv = $ext -match "sqlsrv"
    $hasPdo = $ext -match "pdo_sqlsrv"
    if ($hasSqlsrv -and $hasPdo) {
        Write-Host "[OK] Extensiones PHP sqlsrv y pdo_sqlsrv activas." -ForegroundColor Green
    } else {
        Write-Host "[!!] Faltan extensiones PHP para SQL Server." -ForegroundColor Yellow
        Write-Host "     Descarga los drivers para tu version de PHP (x64):" -ForegroundColor Gray
        Write-Host "     https://learn.microsoft.com/sql/connect/php/download-drivers-php-sql-server" -ForegroundColor Gray
        Write-Host "     Copia php_sqlsrv.dll y php_pdo_sqlsrv.dll a la carpeta ext de PHP" -ForegroundColor Gray
        Write-Host "     y agrega en php.ini: extension=sqlsrv y extension=pdo_sqlsrv" -ForegroundColor Gray
    }
} else {
    Write-Host "[!!] PHP no esta en el PATH de esta terminal." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Listo. Reinicia la terminal y ejecuta: php artisan serve" -ForegroundColor Cyan
Write-Host ""
