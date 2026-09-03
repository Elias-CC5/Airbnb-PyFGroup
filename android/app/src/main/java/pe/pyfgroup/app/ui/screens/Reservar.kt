package pe.pyfgroup.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import pe.pyfgroup.app.core.model.Cotizacion
import pe.pyfgroup.app.data.Repositorio
import pe.pyfgroup.app.data.Resultado
import pe.pyfgroup.app.ui.fecha
import pe.pyfgroup.app.ui.fechaIso
import pe.pyfgroup.app.ui.soles
import java.time.LocalDate

data class EstadoReserva(
    val entrada: LocalDate = LocalDate.now().plusDays(1),
    val salida: LocalDate = LocalDate.now().plusDays(3),
    val huespedes: Int = 1,
    val notas: String = "",
    val cotizacion: Cotizacion? = null,
    val cotizando: Boolean = false,
    val reservando: Boolean = false,
    val error: String? = null,
    val codigoConfirmado: String? = null,
)

class ReservaVM(
    private val repo: Repositorio,
    private val alojamientoId: String,
    private val maxHuespedes: Int,
) : ViewModel() {

    private val _estado = MutableStateFlow(EstadoReserva())
    val estado: StateFlow<EstadoReserva> = _estado.asStateFlow()

    init {
        cotizar()
    }

    fun cambiarEntrada(dia: LocalDate) {
        _estado.update { actual ->
            // La salida siempre después de la entrada. Si el cambio la deja
            // detrás, se empuja un día: es lo que la persona quería decir.
            val salida = if (!actual.salida.isAfter(dia)) dia.plusDays(1) else actual.salida
            actual.copy(entrada = dia, salida = salida)
        }
        cotizar()
    }

    fun cambiarSalida(dia: LocalDate) {
        _estado.update { it.copy(salida = dia) }
        cotizar()
    }

    fun cambiarHuespedes(cantidad: Int) {
        _estado.update { it.copy(huespedes = cantidad.coerceIn(1, maxHuespedes)) }
        cotizar()
    }

    fun cambiarNotas(texto: String) = _estado.update { it.copy(notas = texto) }

    /**
     * El precio lo calcula SIEMPRE el backend, nunca la app.
     *
     * Multiplicar noches por precio aquí daría un número que puede no coincidir
     * con el que se cobra: el backend aplica limpieza y podría aplicar
     * descuentos. Enseñar un total distinto del real es peor que no enseñarlo.
     */
    fun cotizar() {
        val actual = _estado.value
        viewModelScope.launch {
            _estado.update { it.copy(cotizando = true, error = null) }

            when (
                val r = repo.cotizar(
                    alojamientoId,
                    fechaIso(actual.entrada),
                    fechaIso(actual.salida),
                    actual.huespedes,
                )
            ) {
                is Resultado.Ok -> _estado.update { it.copy(cotizando = false, cotizacion = r.valor) }
                is Resultado.Error -> _estado.update {
                    it.copy(cotizando = false, cotizacion = null, error = r.mensaje)
                }
            }
        }
    }

    fun confirmar() {
        val actual = _estado.value
        if (actual.cotizacion?.available != true) return

        viewModelScope.launch {
            _estado.update { it.copy(reservando = true, error = null) }

            when (
                val r = repo.reservar(
                    alojamientoId,
                    fechaIso(actual.entrada),
                    fechaIso(actual.salida),
                    actual.huespedes,
                    actual.notas,
                )
            ) {
                is Resultado.Ok -> _estado.update {
                    it.copy(reservando = false, codigoConfirmado = r.valor.code)
                }
                is Resultado.Error -> _estado.update {
                    it.copy(reservando = false, error = r.mensaje)
                }
            }
        }
    }
}

@Composable
fun PantallaReservar(
    vm: ReservaVM,
    titulo: String,
    onListo: () -> Unit,
) {
    val estado by vm.estado.collectAsState()

    // Reserva hecha: se sale de la pantalla y se avisa.
    if (estado.codigoConfirmado != null) {
        AlertDialog(
            onDismissRequest = onListo,
            title = { Text("Reserva registrada") },
            text = {
                Text(
                    "Tu código es ${estado.codigoConfirmado}. Queda pendiente de " +
                        "confirmación; te escribiremos para coordinar la llegada.",
                )
            },
            confirmButton = { TextButton(onClick = onListo) { Text("Entendido") } },
        )
        return
    }

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
    ) {
        Text(titulo, style = MaterialTheme.typography.titleLarge)
        Spacer(Modifier.height(20.dp))

        SelectorFecha("Llegada", estado.entrada, LocalDate.now(), vm::cambiarEntrada)
        Spacer(Modifier.height(12.dp))
        SelectorFecha("Salida", estado.salida, estado.entrada.plusDays(1), vm::cambiarSalida)

        Spacer(Modifier.height(20.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            Text("Huéspedes", style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f))
            FilledTonalIconButton(onClick = { vm.cambiarHuespedes(estado.huespedes - 1) }) {
                Text("−")
            }
            Text(
                "${estado.huespedes}",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(horizontal = 16.dp),
            )
            FilledTonalIconButton(onClick = { vm.cambiarHuespedes(estado.huespedes + 1) }) {
                Text("+")
            }
        }

        Spacer(Modifier.height(20.dp))

        OutlinedTextField(
            value = estado.notas,
            onValueChange = vm::cambiarNotas,
            label = { Text("Notas para el anfitrión (opcional)") },
            placeholder = { Text("Llegamos alrededor de las 8 pm") },
            minLines = 2,
            keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(
                keyboardType = KeyboardType.Text,
            ),
            modifier = Modifier.fillMaxWidth(),
        )

        Spacer(Modifier.height(24.dp))

        when {
            estado.cotizando -> LinearProgressIndicator(Modifier.fillMaxWidth())

            estado.cotizacion?.available == false -> Surface(
                color = MaterialTheme.colorScheme.errorContainer,
                shape = MaterialTheme.shapes.medium,
            ) {
                Text(
                    estado.cotizacion?.reason ?: "Esas fechas no están disponibles.",
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(16.dp),
                )
            }

            estado.cotizacion != null -> {
                val c = estado.cotizacion!!
                Column {
                    Linea("${c.nights} noches × ${soles(c.pricePerNight)}", soles(c.subtotal))
                    if (c.cleaningFee > 0) {
                        Spacer(Modifier.height(8.dp))
                        Linea("Limpieza", soles(c.cleaningFee))
                    }
                    Spacer(Modifier.height(12.dp))
                    HorizontalDivider()
                    Spacer(Modifier.height(12.dp))
                    Linea("Total", soles(c.total), destacado = true)
                }
            }
        }

        estado.error?.let {
            Spacer(Modifier.height(16.dp))
            Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium)
        }

        Spacer(Modifier.height(28.dp))

        Button(
            onClick = vm::confirmar,
            enabled = estado.cotizacion?.available == true && !estado.reservando,
            modifier = Modifier.fillMaxWidth(),
        ) {
            if (estado.reservando) {
                CircularProgressIndicator(Modifier.size(18.dp), strokeWidth = 2.dp)
            } else {
                Text("Confirmar reserva")
            }
        }
    }
}

@Composable
private fun Linea(etiqueta: String, valor: String, destacado: Boolean = false) {
    val estilo = if (destacado) MaterialTheme.typography.titleMedium
    else MaterialTheme.typography.bodyLarge

    Row {
        Text(etiqueta, style = estilo, modifier = Modifier.weight(1f))
        Text(valor, style = estilo)
    }
}

/**
 * Selector de fecha con el diálogo nativo de Material 3.
 *
 * `minimo` bloquea el pasado y, en la salida, cualquier día anterior a la
 * llegada. Impedirlo aquí evita un viaje al servidor para que rechace algo
 * que ya sabíamos que era inválido.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SelectorFecha(
    etiqueta: String,
    valor: LocalDate,
    minimo: LocalDate,
    onCambio: (LocalDate) -> Unit,
) {
    var abierto by remember { mutableStateOf(false) }

    OutlinedCard(onClick = { abierto = true }, modifier = Modifier.fillMaxWidth()) {
        Row(
            Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                etiqueta,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.weight(1f),
            )
            Text(fecha(valor.toString()), style = MaterialTheme.typography.titleSmall)
        }
    }

    if (abierto) {
        val estado = rememberDatePickerState(
            initialSelectedDateMillis = valor.toEpochDay() * 86_400_000L,
            selectableDates = object : SelectableDates {
                override fun isSelectableDate(utcTimeMillis: Long): Boolean =
                    utcTimeMillis >= minimo.toEpochDay() * 86_400_000L
            },
        )

        DatePickerDialog(
            onDismissRequest = { abierto = false },
            confirmButton = {
                TextButton(onClick = {
                    estado.selectedDateMillis?.let {
                        onCambio(LocalDate.ofEpochDay(it / 86_400_000L))
                    }
                    abierto = false
                }) { Text("Elegir") }
            },
            dismissButton = { TextButton(onClick = { abierto = false }) { Text("Cancelar") } },
        ) {
            DatePicker(state = estado)
        }
    }
}
