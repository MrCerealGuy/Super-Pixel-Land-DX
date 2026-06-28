$info = git log -1 --format='%h %cd' --date=format:%Y-%m-%d
$content = "const BUILD_VERSION = '$info';`n"
Set-Content -Path "$PSScriptRoot\version.js" -Value $content -NoNewline
Write-Host "version.js updated: $info"
