$publicDir = "c:\Users\Clyde T.M\Desktop\TECHCITY\public"
$htmlFiles = Get-ChildItem -Path $publicDir -Filter "*.html" -Recurse

$fontAwesome = '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">'
$botScript = '<script src="/scripts/bot.js"></script>'
$whatsappHtml = @"
<a href="https://wa.me/263783187312" class="whatsapp-button" target="_blank" aria-label="Chat with us on WhatsApp">
    <i class="fab fa-whatsapp"></i>
</a>
"@

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $modified = $false

    if ($content -notmatch "all\.min\.css" -and $content -notmatch "font-awesome") {
        $content = $content -replace '</head>', "`n    $fontAwesome`n</head>"
        $modified = $true
    }

    if ($content -notmatch "bot\.js") {
        $content = $content -replace '</body>', "`n    $botScript`n</body>"
        $modified = $true
    }

    if ($content -notmatch "whatsapp-button" -and $content -notmatch "wa\.me") {
        $content = $content -replace '</body>', "`n$whatsappHtml`n</body>"
        $modified = $true
    }

    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -Encoding UTF8
        Write-Host "Updated $($file.FullName)"
    }
}
