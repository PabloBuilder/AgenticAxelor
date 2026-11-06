$ErrorActionPreference = 'Stop'
$repo = (Resolve-Path (Join-Path $PSScriptRoot '../../../..')).Path
$cli = Join-Path $repo 'node_modules\n8n-axi\bin\n8n-axi.js'
if (-not (Get-Command node -ErrorAction SilentlyContinue) -or -not (Test-Path -LiteralPath $cli)) {
    Write-Host 'Node.js ou CLI MCP n8n absente. Lancez npm install dans le projet.'
    exit 1
}
Write-Host 'Configuration du MCP n8n pour votre compte Windows.'
Write-Host 'Le token MCP est distinct de la cle API n8n : ne les confondez pas.'
Write-Host 'L URL et le token se trouvent dans n8n : Settings > Instance-level MCP > Connect a client.'
Write-Host 'ATTENTION : les variables utilisateur Windows ne sont pas chiffrees.'
Write-Host 'Cette operation remplacera les valeurs utilisateur N8N_MCP_URL et N8N_MCP_TOKEN.'
if ((Read-Host 'Continuer ? Tapez OUI') -cne 'OUI') {
    Write-Host 'Configuration annulee, aucune modification.'
    exit 1
}
$url = Read-Host 'URL MCP complete (https://.../mcp-server/http)'
$uri = $null
if (-not [Uri]::TryCreate($url, [UriKind]::Absolute, [ref]$uri) -or $uri.Scheme -ne 'https' -or $uri.UserInfo -or $uri.Query -or $uri.Fragment -or -not $uri.AbsolutePath.TrimEnd('/').EndsWith('/mcp-server/http')) {
    Write-Host 'URL MCP HTTPS invalide. Aucune modification.'
    exit 1
}
$key = Read-Host 'Collez le token MCP (saisie masquee)' -AsSecureString
if ($key.Length -eq 0) { Write-Host 'Token vide. Aucune modification.'; exit 1 }
$pointer = [IntPtr]::Zero
$plain = $null
$previousUrl = $env:N8N_MCP_URL
$previousToken = $env:N8N_MCP_TOKEN
try {
    $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($key)
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    $env:N8N_MCP_URL = $url
    $env:N8N_MCP_TOKEN = $plain
    Write-Host 'Verification MCP en lecture seule...'
    # Suppress all server output; no tokens, workflow data or server errors are printed.
    & node $cli workflows list --limit 1 *> $null
    if ($LASTEXITCODE -ne 0) {
        Write-Host 'Verification MCP impossible ou refusee. Aucune variable utilisateur modifiee.'
        exit 1
    }
    [Environment]::SetEnvironmentVariable('N8N_MCP_URL', $url, 'User')
    [Environment]::SetEnvironmentVariable('N8N_MCP_TOKEN', $plain, 'User')
    Write-Host 'MCP verifie et configuration enregistree. Redemarrez Goose.'
} catch {
    Write-Host 'Echec de la configuration. Une modification partielle est possible ; verifiez sans afficher le token.'
    exit 1
} finally {
    $env:N8N_MCP_URL = $previousUrl
    $env:N8N_MCP_TOKEN = $previousToken
    $plain = $null
    if ($pointer -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer) }
    $key.Dispose()
}
