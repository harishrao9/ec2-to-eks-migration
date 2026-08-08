$path = 'C:\Users\DELL\Desktop\ec2-to-eks-migration\foodrush-key.pem'
if (-not (Test-Path $path)) {
    Write-Error "Missing key file: $path"
    exit 1
}

$text = Get-Content -Path $path -Raw -Encoding ASCII
$text = $text -replace "`r|`n", ''
$hdr = '-----BEGIN RSA PRIVATE KEY-----'
$ftr = '-----END RSA PRIVATE KEY-----'
if (-not ($text.StartsWith($hdr) -and $text.EndsWith($ftr))) {
    Write-Error 'PEM header/footer invalid'
    exit 1
}

$body = $text.Substring($hdr.Length, $text.Length - $hdr.Length - $ftr.Length).Trim()
$body = $body -replace '\s', ''
$chunks = @()
for ($i = 0; $i -lt $body.Length; $i += 64) {
    $chunks += $body.Substring($i, [Math]::Min(64, $body.Length - $i))
}
$pem = "$hdr`n$($chunks -join "`n")`n$ftr`n"
[System.IO.File]::WriteAllText($path, $pem)
Write-Host 'Repaired PEM file successfully.'
Write-Host 'Header:'
Get-Content -Path $path -TotalCount 1
Write-Host 'Footer:'
Get-Content -Path $path -Tail 1
if (Get-Command ssh-keygen -ErrorAction SilentlyContinue) {
    ssh-keygen -y -f $path | Select-Object -First 1
} else {
    Write-Host 'ssh-keygen unavailable'
}
