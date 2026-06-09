$wshell = New-Object -ComObject Wscript.Shell
$counter = 0
while ($counter -lt 20) {
    if ($wshell.AppActivate("Open")) {
        Start-Sleep -Milliseconds 500
        $wshell.SendKeys("c:\Users\SAM\Documents\Antigravity\indiaCardredemptions\indiaCardRedemptions\assets\social_media\2026-06-09_week1_post1_catalog_trap\slide1_cover.png")
        Start-Sleep -Milliseconds 500
        $wshell.SendKeys("{ENTER}")
        Write-Output "File path sent and Enter pressed."
        break
    }
    Start-Sleep -Milliseconds 500
    $counter++
}
