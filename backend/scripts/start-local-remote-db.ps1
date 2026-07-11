<#
  Load the Git-ignored .env.local file and start Spring Boot on local port 8081.
  Run open-db-tunnel.ps1 in another PowerShell window before starting this script.
#>
[CmdletBinding()]
param(
    [int]$ServerPort = 8081,
    [int]$LocalDbPort = 3307
)

$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot ".env.local"
if (-not (Test-Path $envFile)) {
    throw "Local config not found: $envFile. Create it from .env.local.example."
}

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith("#") -and $line -match "^([^=]+)=(.*)$") {
        Set-Item -Path "Env:$($matches[1].Trim())" -Value $matches[2]
    }
}

foreach ($requiredVariable in "DB_USERNAME", "DB_PASSWORD", "APP_JWT_SECRET") {
    if (-not (Test-Path "Env:$requiredVariable") -or [string]::IsNullOrWhiteSpace((Get-Item "Env:$requiredVariable").Value)) {
        throw ".env.local is missing required value: $requiredVariable"
    }
}

# MySQL listens only on the server loopback interface, so JDBC uses the local SSH tunnel.
$env:DB_URL = "jdbc:mysql://127.0.0.1:$LocalDbPort/personal_website?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai"
$env:SERVER_ADDRESS = "127.0.0.1"
$env:SERVER_PORT = "$ServerPort"

# The project requires Java 21, independent of the system default Java version.
$jdkHome = "C:\Program Files\Java\jdk-21.0.3+9"
if (-not (Test-Path (Join-Path $jdkHome "bin\java.exe"))) {
    throw "JDK 21 not found: $jdkHome"
}
$env:JAVA_HOME = $jdkHome
$env:Path = "$(Join-Path $jdkHome "bin");$env:Path"

Push-Location $projectRoot
try {
    Write-Host "Starting local backend: http://127.0.0.1:$ServerPort/api/actuator/health" -ForegroundColor Green
    & mvn spring-boot:run
}
finally {
    Pop-Location
}
