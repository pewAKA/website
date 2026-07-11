<#
  Run this script in a dedicated PowerShell window.
  It keeps an encrypted SSH tunnel from local port 3307 to server MySQL port 3306.
#>
[CmdletBinding()]
param(
    [int]$LocalDbPort = 3307
)

$identityFile = Join-Path $env:USERPROFILE ".ssh\website_ed25519"
if (-not (Test-Path $identityFile)) {
    throw "SSH private key not found: $identityFile"
}

$forwardRule = "{0}:127.0.0.1:3306" -f $LocalDbPort
Write-Host "SSH tunnel started: 127.0.0.1:$LocalDbPort -> server MySQL. Keep this window open." -ForegroundColor Green

# Use an argument array to keep PowerShell parsing independent from SSH arguments.
$sshArguments = @(
    "-N",
    "-L", $forwardRule,
    "-i", $identityFile,
    "-o", "IdentitiesOnly=yes",
    "-o", "KexAlgorithms=curve25519-sha256",
    "ubuntu@42.193.22.2"
)
& ssh @sshArguments
