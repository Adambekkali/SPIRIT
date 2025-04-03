param(
    [Parameter(Position=0)]
    [string]$Env = "d",

    [Parameter(Position=1, ValueFromRemainingArguments=$true)]
    [string[]]$DockerArgs
)

# Vérifier si l'environnement est valide
if ($Env -notin @("du", "tu", "pu", "dd", "td", "pd")) {
    Write-Host "Environnement non valide." -ForegroundColor Red
    Write-Host "Utilisez 'du' pour dev up, 'tu' pour test up, 'pu' pour prod up." -ForegroundColor Red
    Write-Host "Utilisez 'dd' pour dev down, 'td' pour test down, 'pd' pour prod down." -ForegroundColor Red
    exit 1
}

$composeFiles = @{
    "du" = "docker-compose.yml up -d"
    "tu" = "docker-compose.yml -f docker-compose.test.yml up -d --build --no-cache test-runner"
    "pu" = "docker-compose.yml -f docker-compose.prod.yml up -d --build --no-cache"
    "dd" = "docker-compose.yml down"
    "td" = "docker-compose -f docker-compose.test.yml down -v"
    "pd" = "docker-compose -f docker-compose.prod.yml down"
}

$files = $composeFiles[$Env]

# Construire la commande en concaténant avec les arguments
$command = "docker-compose -f $files"

Write-Host "Exécution de: $command" -ForegroundColor Cyan
Invoke-Expression $command