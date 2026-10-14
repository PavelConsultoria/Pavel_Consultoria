# Reuses the site's original bitmap assets, palette and Segoe UI typography.
Add-Type -AssemblyName System.Drawing
$siteRoot = Split-Path $PSScriptRoot -Parent
$outputDir = Join-Path $siteRoot 'assets/social'
New-Item -ItemType Directory -Path $outputDir -Force | Out-Null
function Color($hex) { [System.Drawing.ColorTranslator]::FromHtml($hex) }
function Draw-Asset($graphics, $file, $x, $y, $width, $height) {
    $source = [System.Drawing.Image]::FromFile((Join-Path $siteRoot $file))
    try { $graphics.DrawImage($source, [System.Drawing.RectangleF]::new($x,$y,$width,$height)) }
    finally { $source.Dispose() }
}
function Draw-Text($graphics, $text, $size, $x, $y, $width, $height, $hex, $bold=$false) {
    $style = [System.Drawing.FontStyle]::Regular
    if ($bold) { $style = [System.Drawing.FontStyle]::Bold }
    $font = [System.Drawing.Font]::new('Segoe UI',$size,$style,[System.Drawing.GraphicsUnit]::Pixel)
    $brush = [System.Drawing.SolidBrush]::new((Color $hex))
    try { $graphics.DrawString($text,$font,$brush,[System.Drawing.RectangleF]::new($x,$y,$width,$height)) }
    finally { $font.Dispose(); $brush.Dispose() }
}
$cards = @(
    @{ Name='home'; Background='consultoria-home.png'; Tint='#1b252a'; Title='Consultoria em Gestão de Projetos'; Subtitle='Treinamentos e Soluções Especializadas'; Text='Planejamento e gestão de cronogramas, treinamentos MS Project e Primavera P6 e análise forense de atrasos.' },
    @{ Name='ms-project'; Background='msproject-fundo.png'; Tint='#0c2029'; Title='MS Project'; Subtitle='do Básico ao Avançado'; Text='8 horas · Online ao vivo · Turmas reduzidas · Apostila completa · Certificado digital' },
    @{ Name='primavera'; Background='primavera-fundo.png'; Tint='#14222e'; Title='Primavera'; Subtitle='Básico e Avançado'; Text='8 horas (Básico) · Online ao vivo · Turmas reduzidas · Apostila completa · Certificado digital' },
    @{ Name='agenda'; Title='Agenda de Treinamentos'; Subtitle='Planeje seu próximo passo profissional.'; Text='Escolha a turma que melhor se adapta à sua disponibilidade: noturna ou sábado.' },
    @{ Name='certificacao-pmp'; Background='pmp-fundo.png'; Tint='#1b252a'; Title='Certificação PMP'; Subtitle='Pavel PMP Simulator'; Text='Uma solução digital própria para apoiar sua preparação para o exame PMP.' }
)
foreach ($card in $cards) {
    $bitmap = [System.Drawing.Bitmap]::new(1200,630)
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
    try {
        $foreground = '#ffffff'
        $graphics.Clear((Color '#f0f3f0'))
        if ($card.Background) {
            $source = [System.Drawing.Image]::FromFile((Join-Path $siteRoot ('assets/' + $card.Background)))
            try {
                $scale = [Math]::Max(1200 / $source.Width, 540 / $source.Height)
                $w = $source.Width * $scale; $h = $source.Height * $scale
                $graphics.DrawImage($source,[System.Drawing.RectangleF]::new((1200-$w)/2,90+(540-$h)/2,$w,$h))
            } finally { $source.Dispose() }
            $tint = Color $card.Tint
            $gradient = [System.Drawing.Drawing2D.LinearGradientBrush]::new([System.Drawing.Rectangle]::new(0,90,1200,540),[System.Drawing.Color]::FromArgb(245,$tint),[System.Drawing.Color]::FromArgb(48,$tint),0.0)
            try { $graphics.FillRectangle($gradient,0,90,1200,540) } finally { $gradient.Dispose() }
        } else { $foreground = '#263c31' }
        $header = [System.Drawing.SolidBrush]::new((Color '#1b252a'))
        try { $graphics.FillRectangle($header,0,0,1200,90) } finally { $header.Dispose() }
        Draw-Asset $graphics 'assets/logo-pavel-dark.png' 64 20 180 60
        Draw-Text $graphics $card.Title 44 64 160 850 120 $foreground $true
        Draw-Text $graphics $card.Subtitle 32 64 300 850 100 $foreground $true
        Draw-Text $graphics $card.Text 20 64 410 640 130 $foreground
        $bitmap.Save((Join-Path $outputDir ($card.Name + '.png')),[System.Drawing.Imaging.ImageFormat]::Png)
    } finally { $graphics.Dispose(); $bitmap.Dispose() }
}
