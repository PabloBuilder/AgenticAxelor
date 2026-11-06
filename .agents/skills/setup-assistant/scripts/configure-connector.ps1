param(
    [Parameter(Mandatory = $true)]
    [ValidateSet('Redmine', 'N8n')]
    [string]$Connector
)

$ErrorActionPreference = 'Stop'
if ($Connector -eq 'Redmine') {
    $urlName = 'REDMINE_URL'
    $keyName = 'REDMINE_API_KEY'
    $defaultUrl = 'https://redmine.alter-si.fr'
} else {
    $urlName = 'N8N_BASE_URL'
    $keyName = 'N8N_API_KEY'
    $defaultUrl = 'https://automation.alter-si.fr'
}

Write-Host "Configuration $Connector pour l'utilisateur Windows actuel."
Write-Host 'ATTENTION : les variables utilisateur Windows ne sont pas chiffrees.'
Write-Host "Cette operation remplacera les valeurs utilisateur existantes de $urlName et $keyName."
Write-Host 'Ne partagez pas cette fenetre et ne collez jamais votre cle dans le chat.'
if ((Read-Host 'Continuer ? Tapez OUI') -cne 'OUI') {
    Write-Host 'Configuration annulee, aucune modification.'
    exit 1
}

if ($defaultUrl) {
    $url = Read-Host "URL du service (Entree : $defaultUrl)"
    if ([string]::IsNullOrWhiteSpace($url)) { $url = $defaultUrl }
} else {
    $url = Read-Host 'URL du service n8n (https://...)'
}
$uri = $null
if (-not [Uri]::TryCreate($url, [UriKind]::Absolute, [ref]$uri) -or $uri.Scheme -ne 'https' -or $uri.UserInfo -or $uri.Query -or $uri.Fragment) {
    Write-Host 'URL invalide : utilisez une URL HTTPS sans identifiants, parametres ou fragment. Aucune modification.'
    exit 1
}

$key = Read-Host 'Collez la cle API (saisie masquee)' -AsSecureString
if ($key.Length -eq 0) {
    Write-Host 'Cle vide. Aucune modification.'
    exit 1
}

$pointer = [IntPtr]::Zero
$plain = $null
try {
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($key)
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    if ($Connector -eq 'Redmine') {
        $headerName = 'X-Redmine-API-Key'
        $testUrl = $url.TrimEnd('/') + '/my/account.json'
    } else {
        $headerName = 'X-N8N-API-KEY'
        $testUrl = $url.TrimEnd('/') + '/api/v1/workflows?limit=1'
    }
    Write-Host 'Verification de la connexion en lecture seule...'
    try {
        $response = Invoke-WebRequest -Uri $testUrl -Headers @{ $headerName = $plain } -Method Get -TimeoutSec 10 -MaximumRedirection 0 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -lt 200 -or $response.StatusCode -ge 300) { throw 'Unexpected status' }
        $response = $null
    } catch {
        Write-Host 'Verification impossible ou refusee : verifiez URL, cle et reseau. Aucune variable modifiee.'
        exit 1
    }
    [Environment]::SetEnvironmentVariable($urlName, $url, 'User')
    [Environment]::SetEnvironmentVariable($keyName, $plain, 'User')
    Write-Host 'Connexion verifiee et configuration enregistree. Redemarrez Goose pour charger les variables.'
} catch {
    Write-Host 'Echec de la configuration. Une modification partielle est possible ; verifiez la configuration sans afficher la cle.'
    exit 1
} finally {
    $plain = $null
    if ($pointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
    $key.Dispose()
}

$repo = (Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
if ($Connector -eq 'Redmine') {
    $cli = Join-Path $repo 'scripts\redmine-axi.cjs'
} else {
    $cli = Join-Path $env:LOCALAPPDATA 'Alter-si\connectors\n8n-axi\0.1.0\n8n-axi-0.1.0-win-x64\n8n-axi.exe'
}
if (($Connector -eq 'Redmine' -and -not (Get-Command node -ErrorAction SilentlyContinue)) -or -not (Test-Path -LiteralPath $cli)) {
    Write-Host 'CLI compatible introuvable. La verification API a reussi mais le connecteur reste a installer.'
    exit 1
}
Write-Host 'CLI detectee. Aucun fichier Pi ni PATH modifie.'
Write-Host 'La connexion depuis Goose reste a verifier apres redemarrage.'
