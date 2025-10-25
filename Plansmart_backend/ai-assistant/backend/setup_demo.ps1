# Setup Demo Environment Script
# This script sets up and seeds the demo user with sample data

Write-Host "=================================================="
Write-Host "PLANSMART Demo User Setup"
Write-Host "=================================================="
Write-Host ""

# Get the current directory
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "📍 Working directory: $scriptPath"
Write-Host ""

# Check if requirements are installed
Write-Host "🔍 Checking dependencies..."
$pipList = pip list 2>&1 | Out-String

if ($pipList -contains "Flask") {
    Write-Host "✅ Dependencies already installed"
} else {
    Write-Host "📦 Installing dependencies from requirements.txt..."
    pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install dependencies"
        exit 1
    }
    Write-Host "✅ Dependencies installed"
}

Write-Host ""

# Check if .env exists
if (Test-Path ".env") {
    Write-Host "✅ .env file already exists"
} else {
    Write-Host "📝 Creating .env file from template..."
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-Host "✅ .env file created"
    } else {
        Write-Host "⚠️  .env.example not found. Creating default .env..."
        @"
SECRET_KEY=your-secret-key-change-in-production
FLASK_ENV=development
FLASK_DEBUG=True
"@ | Out-File -Encoding UTF8 ".env"
        Write-Host "✅ .env file created with defaults"
    }
}

Write-Host ""

# Check if database exists and is old
if (Test-Path "instance/ai_assistant.db") {
    Write-Host "⚠️  Database already exists"
    Write-Host "🗑️  To reset with fresh demo data, delete: instance/ai_assistant.db"
    Write-Host ""
    $response = Read-Host "Keep existing database? (y/n)"
    if ($response -ne "n" -and $response -ne "N") {
        Write-Host "✅ Keeping existing database"
    } else {
        Write-Host "🗑️  Removing old database..."
        Remove-Item "instance/ai_assistant.db" -Force
        Write-Host "✅ Database removed"
    }
} else {
    Write-Host "📝 Creating new database directory..."
    New-Item -ItemType Directory -Path "instance" -Force | Out-Null
}

Write-Host ""

# Run seed script
Write-Host "🌱 Seeding database with demo data..."
Write-Host ""
python seed_demo_data.py

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to seed database"
    exit 1
}

Write-Host ""
Write-Host "🎉 Demo setup complete!"
Write-Host ""
Write-Host "📋 Next steps:"
Write-Host "   1. Start the Flask backend:"
Write-Host "      python app.py"
Write-Host ""
Write-Host "   2. In another terminal, start the frontend server:"
Write-Host "      cd ../frontend"
Write-Host "      python -m http.server 8000"
Write-Host ""
Write-Host "   3. Open browser and go to:"
Write-Host "      http://localhost:8000/login.html"
Write-Host ""
Write-Host "   4. Login with:"
Write-Host "      Username: demo_user"
Write-Host "      Password: Demo@123"
Write-Host ""
Write-Host "   5. Talk to the AI and interact with your tasks/schedules!"
Write-Host ""
Write-Host "=================================================="