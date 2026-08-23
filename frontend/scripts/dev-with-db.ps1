<#
  Windows 开发入口：按 .env.local 配置复用或创建 SSH 数据库隧道，
  隧道就绪后启动 Next.js，并在退出时清理本脚本创建的 ssh 进程。
#>
[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$projectRoot = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $projectRoot '.env.local'

function Read-LocalEnvironment([string]$Path) {
  $values = @{}
  if (-not (Test-Path -LiteralPath $Path)) {
    return $values
  }

  Get-Content -LiteralPath $Path | ForEach-Object {
    $line = $_.Trim()
    if ($line -and -not $line.StartsWith('#') -and $line -match '^([^=]+)=(.*)$') {
      $key = $Matches[1].Trim()
      $value = $Matches[2].Trim()
      if ($value.Length -ge 2 -and (
        ($value.StartsWith('"') -and $value.EndsWith('"')) -or
        ($value.StartsWith("'") -and $value.EndsWith("'"))
      )) {
        $value = $value.Substring(1, $value.Length - 2)
      }
      $values[$key] = $value
    }
  }
  return $values
}

function Test-TcpPort([string]$HostName, [int]$Port) {
  $client = [System.Net.Sockets.TcpClient]::new()
  try {
    $connection = $client.ConnectAsync($HostName, $Port)
    return $connection.Wait(300) -and $client.Connected
  }
  catch {
    return $false
  }
  finally {
    $client.Dispose()
  }
}

function Start-NextDevelopmentServer {
  $nextCli = Join-Path $projectRoot 'node_modules\next\dist\bin\next'
  if (-not (Test-Path -LiteralPath $nextCli)) {
    throw '未找到 Next.js 依赖，请先执行 npm install。'
  }
  & node $nextCli dev
  $script:nextExitCode = $LASTEXITCODE
}

$settings = Read-LocalEnvironment $envFile
$tunnelEnabled = $settings['DB_TUNNEL_ENABLED'] -eq 'true'
$tunnelProcess = $null
$ownsTunnel = $false
$exitCode = 1

Push-Location $projectRoot
try {
  if ($tunnelEnabled) {
    $localPort = if ($settings['DB_TUNNEL_LOCAL_PORT']) {
      [int]$settings['DB_TUNNEL_LOCAL_PORT']
    } else {
      3307
    }
    $remoteHost = if ($settings['DB_TUNNEL_REMOTE_HOST']) {
      $settings['DB_TUNNEL_REMOTE_HOST']
    } else {
      '127.0.0.1'
    }
    $remotePort = if ($settings['DB_TUNNEL_REMOTE_PORT']) {
      [int]$settings['DB_TUNNEL_REMOTE_PORT']
    } else {
      3306
    }
    $sshHost = $settings['DB_TUNNEL_SSH_HOST']
    if ([string]::IsNullOrWhiteSpace($sshHost)) {
      throw '.env.local 缺少 DB_TUNNEL_SSH_HOST。'
    }

    $identityFile = $settings['DB_TUNNEL_IDENTITY_FILE']
    if ([string]::IsNullOrWhiteSpace($identityFile)) {
      $identityFile = Join-Path $env:USERPROFILE '.ssh\website_ed25519'
    } else {
      $identityFile = [Environment]::ExpandEnvironmentVariables($identityFile)
    }
    if (-not (Test-Path -LiteralPath $identityFile)) {
      throw "SSH 私钥不存在：$identityFile"
    }

    if (Test-TcpPort '127.0.0.1' $localPort) {
      Write-Host "复用已有数据库隧道：127.0.0.1:$localPort" -ForegroundColor DarkGreen
    } else {
      $sshCommand = Get-Command ssh.exe -ErrorAction SilentlyContinue
      if (-not $sshCommand) {
        throw '系统未找到 ssh.exe，请安装 Windows OpenSSH Client。'
      }

      $forwardRule = "${localPort}:${remoteHost}:${remotePort}"
      $sshArguments = @(
        '-N',
        '-L', $forwardRule,
        '-i', "`"$identityFile`"",
        '-o', 'IdentitiesOnly=yes',
        '-o', 'BatchMode=yes',
        '-o', 'ExitOnForwardFailure=yes',
        '-o', 'ServerAliveInterval=30',
        '-o', 'ServerAliveCountMax=3',
        $sshHost
      )

      # 后台隧道不弹出额外窗口；进程句柄只用于本次开发会话的定向清理。
      $startOptions = @{
        FilePath = $sshCommand.Source
        ArgumentList = $sshArguments
        PassThru = $true
        WindowStyle = 'Hidden'
      }
      $tunnelProcess = Start-Process @startOptions
      $ownsTunnel = $true

      $ready = $false
      for ($attempt = 0; $attempt -lt 40; $attempt++) {
        Start-Sleep -Milliseconds 250
        if ($tunnelProcess.HasExited) {
          throw "SSH 隧道启动失败，ssh 退出码：$($tunnelProcess.ExitCode)"
        }
        if (Test-TcpPort '127.0.0.1' $localPort) {
          $ready = $true
          break
        }
      }
      if (-not $ready) {
        throw "SSH 隧道启动超时：127.0.0.1:$localPort"
      }
      Write-Host "数据库隧道已就绪：127.0.0.1:$localPort -> $remoteHost`:$remotePort" -ForegroundColor Green
    }
  }

  Start-NextDevelopmentServer
  $exitCode = $script:nextExitCode
}
finally {
  if ($ownsTunnel -and $tunnelProcess -and -not $tunnelProcess.HasExited) {
    Stop-Process -Id $tunnelProcess.Id
    $tunnelProcess.WaitForExit(3000)
    Write-Host '本次开发会话创建的数据库隧道已关闭。' -ForegroundColor DarkGray
  }
  Pop-Location
}

exit $exitCode
