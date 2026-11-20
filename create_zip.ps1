$sourceDir = "C:\Users\ABC\.gemini\antigravity\scratch\seatsync"
$zipPath = "C:\Users\ABC\.gemini\antigravity\scratch\SeatSync-GitHub-Repository.zip"
$artifactZip = "C:\Users\ABC\.gemini\antigravity\brain\70f1f403-3a21-40f4-8c09-540742cf989f\SeatSync-GitHub-Repository.zip"

if (Test-Path $zipPath) { Remove-Item $zipPath -Force }
if (Test-Path $artifactZip) { Remove-Item $artifactZip -Force }

Compress-Archive -Path "$sourceDir\*" -DestinationPath $zipPath -Force
Copy-Item $zipPath $artifactZip -Force

Write-Output "SUCCESS: ZIP archive created"
Get-Item $zipPath | Select-Object Name, Length
