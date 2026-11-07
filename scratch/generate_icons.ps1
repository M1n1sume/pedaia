Add-Type -AssemblyName System.Drawing

function Generate-PedaiaIcon {
    param (
        [int]$size,
        [string]$outputPath,
        [bool]$roundCorners = $true
    )

    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $scale = $size / 48.0

    # Background Gradient
    $colorTop = [System.Drawing.ColorTranslator]::FromHtml("#7C3AED")
    $colorBottom = [System.Drawing.ColorTranslator]::FromHtml("#3B0764")
    
    $rectX = 2.0 * $scale
    $rectY = 2.0 * $scale
    $rectW = 44.0 * $scale
    $rectH = 44.0 * $scale
    $radius = if ($roundCorners) { 12.0 * $scale } else { 0 }

    $bgRect = New-Object System.Drawing.RectangleF($rectX, $rectY, $rectW, $rectH)
    $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
        $bgRect,
        $colorTop,
        $colorBottom,
        [System.Drawing.Drawing2D.LinearGradientMode]::ForwardDiagonal
    )

    if ($roundCorners) {
        $path = New-Object System.Drawing.Drawing2D.GraphicsPath
        $d = $radius * 2
        $path.AddArc($rectX, $rectY, $d, $d, 180, 90)
        $path.AddArc($rectX + $rectW - $d, $rectY, $d, $d, 270, 90)
        $path.AddArc($rectX + $rectW - $d, $rectY + $rectH - $d, $d, $d, 0, 90)
        $path.AddArc($rectX, $rectY + $rectH - $d, $d, $d, 90, 90)
        $path.CloseFigure()
        $g.FillPath($brush, $path)
    } else {
        $g.FillRectangle($brush, $bgRect)
    }
    $brush.Dispose()

    # Lines
    # M12 34 L20 22 L30 28 L36 14
    $penMain = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(242, 245, 243, 255), (2.6 * $scale))
    $penMain.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penMain.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penMain.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $ptsMain = @(
        (New-Object System.Drawing.PointF((12.0 * $scale), (34.0 * $scale))),
        (New-Object System.Drawing.PointF((20.0 * $scale), (22.0 * $scale))),
        (New-Object System.Drawing.PointF((30.0 * $scale), (28.0 * $scale))),
        (New-Object System.Drawing.PointF((36.0 * $scale), (14.0 * $scale)))
    )
    $g.DrawLines($penMain, $ptsMain)
    $penMain.Dispose()

    # M20 22 L24 34 L30 28
    $penSub = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(180, 221, 214, 254), (1.8 * $scale))
    $penSub.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penSub.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
    $penSub.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round

    $ptsSub = @(
        (New-Object System.Drawing.PointF((20.0 * $scale), (22.0 * $scale))),
        (New-Object System.Drawing.PointF((24.0 * $scale), (34.0 * $scale))),
        (New-Object System.Drawing.PointF((30.0 * $scale), (28.0 * $scale)))
    )
    $g.DrawLines($penSub, $ptsSub)
    $penSub.Dispose()

    # Nodes
    # cx 12 cy 34 r 3.5 fill #FFFFFF
    $bWhite = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $r1 = 3.5 * $scale
    $g.FillEllipse($bWhite, (12.0 * $scale - $r1), (34.0 * $scale - $r1), ($r1 * 2), ($r1 * 2))

    # cx 20 cy 22 r 3 fill #F5F3FF
    $bLavLight = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#F5F3FF"))
    $r2 = 3.0 * $scale
    $g.FillEllipse($bLavLight, (20.0 * $scale - $r2), (22.0 * $scale - $r2), ($r2 * 2), ($r2 * 2))

    # cx 24 cy 34 r 2.5 fill #DDD6FE
    $bLavMid = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#DDD6FE"))
    $r3 = 2.5 * $scale
    $g.FillEllipse($bLavMid, (24.0 * $scale - $r3), (34.0 * $scale - $r3), ($r3 * 2), ($r3 * 2))

    # cx 30 cy 28 r 3 fill #F5F3FF
    $g.FillEllipse($bLavLight, (30.0 * $scale - $r2), (28.0 * $scale - $r2), ($r2 * 2), ($r2 * 2))

    # cx 36 cy 14 r 4.5 fill #FFFFFF
    $rApex = 4.5 * $scale
    $g.FillEllipse($bWhite, (36.0 * $scale - $rApex), (14.0 * $scale - $rApex), ($rApex * 2), ($rApex * 2))

    # Star at Apex: M36 7 L37.2 11.8 L42 13 L37.2 14.2 L36 19 L34.8 14.2 L30 13 L34.8 11.8 Z fill #F59E0B
    $bGold = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#F59E0B"))
    $starPts = @(
        (New-Object System.Drawing.PointF((36.0 * $scale), (7.0 * $scale))),
        (New-Object System.Drawing.PointF((37.2 * $scale), (11.8 * $scale))),
        (New-Object System.Drawing.PointF((42.0 * $scale), (13.0 * $scale))),
        (New-Object System.Drawing.PointF((37.2 * $scale), (14.2 * $scale))),
        (New-Object System.Drawing.PointF((36.0 * $scale), (19.0 * $scale))),
        (New-Object System.Drawing.PointF((34.8 * $scale), (14.2 * $scale))),
        (New-Object System.Drawing.PointF((30.0 * $scale), (13.0 * $scale))),
        (New-Object System.Drawing.PointF((34.8 * $scale), (11.8 * $scale)))
    )
    $g.FillPolygon($bGold, $starPts)
    $bGold.Dispose()

    # Inner circle in apex: cx 36 cy 13 r 1.5 fill #6D28D9
    $bApexInner = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml("#6D28D9"))
    $rInner = 1.5 * $scale
    $g.FillEllipse($bApexInner, (36.0 * $scale - $rInner), (13.0 * $scale - $rInner), ($rInner * 2), ($rInner * 2))
    $bApexInner.Dispose()

    $bWhite.Dispose()
    $bLavLight.Dispose()
    $bLavMid.Dispose()

    $g.Dispose()
    $bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Generated: $outputPath ($size x $size)"
}

Generate-PedaiaIcon -size 192 -outputPath "public/icon-192.png" -roundCorners $true
Generate-PedaiaIcon -size 512 -outputPath "public/icon-512.png" -roundCorners $true
Generate-PedaiaIcon -size 512 -outputPath "public/icon-maskable-512.png" -roundCorners $false
Generate-PedaiaIcon -size 1024 -outputPath "public/icon-1024.png" -roundCorners $false
