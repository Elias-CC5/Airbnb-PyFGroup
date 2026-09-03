package pe.pyfgroup.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Typography
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

/*
  La paleta de la web, traída tal cual: monocroma, con el negro como acento.
  Los nombres coinciden con los tokens de globals.css para que un cambio de
  marca se pueda aplicar en los dos sitios sin traducir nada.
*/
val Tinta900 = Color(0xFF171717)
val Tinta700 = Color(0xFF404040)
val Tinta500 = Color(0xFF737373)
val Tinta200 = Color(0xFFE5E5E5)
val Tinta100 = Color(0xFFF5F5F5)
val Tinta50 = Color(0xFFFAFAFA)
val Peligro = Color(0xFFB91C1C)

private val claro = lightColorScheme(
    primary = Tinta900,
    onPrimary = Color.White,
    secondary = Tinta700,
    onSecondary = Color.White,
    background = Color.White,
    onBackground = Tinta900,
    surface = Color.White,
    onSurface = Tinta900,
    surfaceVariant = Tinta100,
    onSurfaceVariant = Tinta500,
    outline = Tinta200,
    error = Peligro,
)

private val oscuro = darkColorScheme(
    primary = Color.White,
    onPrimary = Tinta900,
    secondary = Tinta200,
    onSecondary = Tinta900,
    background = Color(0xFF0A0A0A),
    onBackground = Color.White,
    surface = Color(0xFF171717),
    onSurface = Color.White,
    surfaceVariant = Color(0xFF262626),
    onSurfaceVariant = Tinta200,
    outline = Color(0xFF404040),
    error = Color(0xFFF87171),
)

/*
  Tipografía de palo seco del sistema. En la web insististe en Arial; en
  Android el equivalente es la fuente por defecto (Roboto), que es la que
  cualquiera espera ver. Meter Arial aquí obligaría a empaquetar el archivo de
  fuente y sumaría peso al APK sin que nadie note la diferencia.
*/
private val tipografia = Typography().let { base ->
    val sans = FontFamily.SansSerif
    Typography(
        displayLarge = base.displayLarge.copy(fontFamily = sans),
        headlineLarge = base.headlineLarge.copy(fontFamily = sans, fontWeight = FontWeight.SemiBold),
        headlineMedium = base.headlineMedium.copy(fontFamily = sans, fontWeight = FontWeight.SemiBold),
        titleLarge = base.titleLarge.copy(fontFamily = sans, fontWeight = FontWeight.SemiBold),
        titleMedium = base.titleMedium.copy(fontFamily = sans, fontWeight = FontWeight.Medium),
        bodyLarge = base.bodyLarge.copy(fontFamily = sans),
        bodyMedium = base.bodyMedium.copy(fontFamily = sans),
        labelLarge = base.labelLarge.copy(fontFamily = sans, fontWeight = FontWeight.Medium),
        labelSmall = TextStyle(fontFamily = sans, fontSize = 11.sp, fontWeight = FontWeight.Medium),
    )
}

@Composable
fun TemaPyf(oscuroForzado: Boolean = isSystemInDarkTheme(), contenido: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = if (oscuroForzado) oscuro else claro,
        typography = tipografia,
        content = contenido,
    )
}
