# Smart Bhatha ERP — first-time database setup (Windows PowerShell)
$ErrorActionPreference = "Stop"
$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $Root

Write-Host ""
Write-Host "=== Smart Bhatha ERP — Database Setup (Windows) ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path ".env")) {
  Copy-Item ".env.example" ".env"
  Write-Host "Created .env from .env.example"
}

Write-Host "Starting PostgreSQL (Docker)..."
docker compose up -d postgres
if ($LASTEXITCODE -ne 0) { throw "docker compose failed. Is Docker Desktop running?" }

Write-Host "Waiting for database..."
$ready = $false
for ($i = 1; $i -le 30; $i++) {
  docker exec smart-bhatha-db pg_isready -U bhatha -d smart_bhatha 2>$null | Out-Null
  if ($LASTEXITCODE -eq 0) {
    $ready = $true
    break
  }
  Start-Sleep -Seconds 1
}
if (-not $ready) { throw "Database did not become ready in time." }

Write-Host "Pushing schema..."
npm run db:push
if ($LASTEXITCODE -ne 0) { throw "db:push failed" }

Write-Host "Seeding demo data..."
npm run db:seed
if ($LASTEXITCODE -ne 0) { throw "db:seed failed" }

Write-Host ""
Write-Host "=== Done ===" -ForegroundColor Green
Write-Host "Double-click Start-SmartBhatha.bat or run: npm run dev"
Write-Host "Login: admin@bhatha.pk / admin123"
Write-Host ""
