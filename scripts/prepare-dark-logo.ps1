# Cópia seletiva do logo: mantém alpha, geometria e pixels coloridos originais.
Add-Type -AssemblyName System.Drawing
Add-Type -ReferencedAssemblies System.Drawing -TypeDefinition @'
using System;
using System.Drawing;
using System.Drawing.Imaging;
public static class PavelDarkLogo {
  public static string Convert(string source, string destination) {
    using (var original = new Bitmap(source))
    using (var copy = new Bitmap(original.Width, original.Height, PixelFormat.Format32bppArgb)) {
      int changed = 0, colored = 0;
      for (int y = 0; y < original.Height; y++) {
        for (int x = 0; x < original.Width; x++) {
          Color pixel = original.GetPixel(x, y);
          int maximum = Math.Max(pixel.R, Math.Max(pixel.G, pixel.B));
          int minimum = Math.Min(pixel.R, Math.Min(pixel.G, pixel.B));
          bool neutral = maximum - minimum <= 8 && minimum >= maximum * .9;
          Color result = pixel;
          if (pixel.A > 0 && neutral) {
            result = Color.FromArgb(pixel.A, 255, 255, 255);
            if (result.ToArgb() != pixel.ToArgb()) changed++;
          } else if (pixel.A > 0) colored++;
          copy.SetPixel(x, y, result);
        }
      }
      copy.Save(destination, ImageFormat.Png);
      using (var saved = new Bitmap(destination)) {
        for (int y = 0; y < original.Height; y++) {
          for (int x = 0; x < original.Width; x++) {
            Color pixel = original.GetPixel(x,y), result = saved.GetPixel(x,y);
            if (pixel.A != result.A) throw new Exception("Canal alpha alterado");
            int maximum = Math.Max(pixel.R, Math.Max(pixel.G, pixel.B));
            int minimum = Math.Min(pixel.R, Math.Min(pixel.G, pixel.B));
            bool neutral = maximum - minimum <= 8 && minimum >= maximum * .9;
            if (pixel.A > 0 && !neutral && pixel.ToArgb() != result.ToArgb())
              throw new Exception("Pixel colorido alterado");
          }
        }
      }
      return String.Format("OK: {0}x{1}; {2} pixels neutros convertidos; {3} pixels coloridos e todo o canal alpha preservados.", original.Width, original.Height, changed, colored);
    }
  }
}
'@
$projectRoot = Split-Path -Parent $PSScriptRoot
[PavelDarkLogo]::Convert((Join-Path $projectRoot 'assets/logo-pavel.png'), (Join-Path $projectRoot 'assets/logo-pavel-dark.png'))
