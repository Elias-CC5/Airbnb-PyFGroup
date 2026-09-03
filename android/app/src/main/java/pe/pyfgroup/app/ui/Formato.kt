package pe.pyfgroup.app.ui

import java.text.NumberFormat
import java.time.LocalDate
import java.time.format.DateTimeFormatter
import java.util.Locale

private val PERU = Locale.forLanguageTag("es-PE")

private val soles: NumberFormat = NumberFormat.getCurrencyInstance(PERU).apply {
    maximumFractionDigits = 0
}

/** "S/ 180" — sin decimales, que en precios por noche sólo estorban. */
fun soles(monto: Double): String = soles.format(monto)

private val entrada = DateTimeFormatter.ISO_LOCAL_DATE
private val bonita = DateTimeFormatter.ofPattern("d MMM yyyy", PERU)

/**
 * Convierte lo que manda la API a algo legible.
 *
 * Las fechas llegan de Prisma como ISO completo con hora ("2026-08-18T00:00:00.000Z")
 * o como fecha suelta, según el endpoint. Se recorta a los diez primeros
 * caracteres antes de parsear en vez de intentar adivinar el formato.
 */
fun fecha(iso: String): String = runCatching {
    LocalDate.parse(iso.take(10), entrada).format(bonita)
}.getOrDefault(iso)

fun fechaIso(dia: LocalDate): String = dia.format(entrada)
