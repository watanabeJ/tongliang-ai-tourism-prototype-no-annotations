param(
  [Security.SecureString]$ApiKey,
  [Security.SecureString]$AmapKey,
  [Security.SecureString]$SearchKey,
  [int]$Port = 4188
)
$ErrorActionPreference = 'Stop'
$secretDirectory = Join-Path ([Environment]::GetFolderPath('LocalApplicationData')) 'TongliangPrototype\copy-20260908-v1'
$secretFile = Join-Path $secretDirectory 'haoee-key.dpapi'
if ($ApiKey) {
  [IO.Directory]::CreateDirectory($secretDirectory) | Out-Null
  # Windows DPAPI: only this Windows account can decrypt the saved credential.
  [IO.File]::WriteAllText($secretFile, (ConvertFrom-SecureString $ApiKey))
}
foreach ($entry in @(@{ Value = $AmapKey; File = 'amap-key.dpapi' }, @{ Value = $SearchKey; File = 'tavily-key.dpapi' })) {
  if ($entry.Value) {
    [IO.Directory]::CreateDirectory($secretDirectory) | Out-Null
    [IO.File]::WriteAllText((Join-Path $secretDirectory $entry.File), (ConvertFrom-SecureString $entry.Value))
  }
}
if (-not (Test-Path -LiteralPath $secretFile)) {
  throw 'No saved API key. Run this script with -ApiKey (Read-Host "API key" -AsSecureString).'
}
if (Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue) {
  throw "Port $Port is occupied. Stop only the verified project process before restarting."
}
$savedKey = ConvertTo-SecureString ([IO.File]::ReadAllText($secretFile))
$keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($savedKey)
$previousKey = $env:HAOEE_API_KEY
$previousPort = $env:PORT
$previousAmap = $env:AMAP_WEB_KEY
$previousSearch = $env:TAVILY_API_KEY
try {
  $env:HAOEE_API_KEY = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
  $env:PORT = [string]$Port
  foreach ($entry in @(@{ Name = 'AMAP_WEB_KEY'; File = 'amap-key.dpapi' }, @{ Name = 'TAVILY_API_KEY'; File = 'tavily-key.dpapi' })) {
    $toolFile = Join-Path $secretDirectory $entry.File
    if (Test-Path -LiteralPath $toolFile) {
      $toolSecure = ConvertTo-SecureString ([IO.File]::ReadAllText($toolFile))
      $toolPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($toolSecure)
      try { [Environment]::SetEnvironmentVariable($entry.Name, [Runtime.InteropServices.Marshal]::PtrToStringBSTR($toolPointer), 'Process') }
      finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($toolPointer); $toolSecure.Dispose() }
    }
  }
  $nodePath = (Get-Command node -ErrorAction Stop).Source
  $serverProcess = Start-Process -FilePath $nodePath -ArgumentList 'serve-prototype.js' -WorkingDirectory $PSScriptRoot -WindowStyle Hidden -PassThru
  $ready = $false
  for ($attempt = 0; $attempt -lt 20; $attempt++) {
    $listener = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    if ($listener -and $listener[0].OwningProcess -eq $serverProcess.Id) { $ready = $true; break }
    if ($serverProcess.HasExited) { throw 'The project server exited before opening its port.' }
    Start-Sleep -Milliseconds 200
  }
  if (-not $ready) { throw 'The project was launched but its port is not ready; inspect the process before retrying.' }
  Write-Output "Project started: PID $($serverProcess.Id), port $Port; key stored with Windows account encryption."
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
  $env:HAOEE_API_KEY = $previousKey
  $env:PORT = $previousPort
  $env:AMAP_WEB_KEY = $previousAmap
  $env:TAVILY_API_KEY = $previousSearch
  $savedKey.Dispose()
}
