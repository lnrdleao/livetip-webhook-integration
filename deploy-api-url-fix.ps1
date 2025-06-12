# Deploy script for API URL fix
$timestamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$logFile = "deploy-log-$timestamp.txt"

# Add message to log file
"🔧 Starting deployment process at $(Get-Date)" | Out-File -FilePath $logFile

# Step 1: Backup current files
Write-Host "📁 Creating backup of current files..." -ForegroundColor Cyan
$backupFolder = "backup_$timestamp"
New-Item -Path $backupFolder -ItemType Directory | Out-Null
Copy-Item -Path "config.js", "liveTipService.js", "qrCodeGenerator.js" -Destination $backupFolder
"✅ Backup completed to folder: $backupFolder" | Out-File -FilePath $logFile -Append

# Step 2: Stage changes
Write-Host "📝 Staging changes for commit..." -ForegroundColor Cyan
git add config.js liveTipService.js qrCodeGenerator.js | Out-File -FilePath $logFile -Append

# Step 3: Commit changes
$commitMessage = "Fix: Corrected API URL and endpoint paths for LiveTip service"
Write-Host "💾 Committing changes: $commitMessage" -ForegroundColor Green
git commit -m $commitMessage | Out-File -FilePath $logFile -Append

# Step 4: Push to GitHub (if configured)
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push | Out-File -FilePath $logFile -Append

# Step 5: Deploy to Vercel (using existing vercel.json)
Write-Host "🌐 Deploying to Vercel production..." -ForegroundColor Magenta
vercel --prod | Out-File -FilePath $logFile -Append

# Final message
Write-Host "✅ Deployment completed! Check $logFile for details" -ForegroundColor Green
"🎉 Deployment completed at $(Get-Date)" | Out-File -FilePath $logFile -Append

# Show deployment summary
Write-Host ""
Write-Host "📊 DEPLOYMENT SUMMARY" -ForegroundColor Cyan
Write-Host "===================="
Write-Host "✅ Fixed API URLs in config.js"
Write-Host "✅ Updated endpoint paths in liveTipService.js"
Write-Host "✅ Created backup in $backupFolder"
Write-Host "✅ Committed to Git: '$commitMessage'"
Write-Host "✅ Pushed to GitHub"
Write-Host "✅ Deployed to Vercel production"
Write-Host ""
Write-Host "🌐 Check production at: https://livetip-webhook-integration.vercel.app"
