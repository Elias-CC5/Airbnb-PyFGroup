package pe.pyfgroup.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import pe.pyfgroup.app.core.model.Alojamiento
import pe.pyfgroup.app.core.model.RangoOcupado
import pe.pyfgroup.app.data.Repositorio
import pe.pyfgroup.app.data.Resultado
import pe.pyfgroup.app.ui.*
import java.time.LocalDate

data class EstadoDetalle(
    val cargando: Boolean = true,
    val alojamiento: Alojamiento? = null,
    val ocupados: List<RangoOcupado> = emptyList(),
    val error: String? = null,
)

class DetalleVM(private val repo: Repositorio, private val slug: String) : ViewModel() {

    private val _estado = MutableStateFlow(EstadoDetalle())
    val estado: StateFlow<EstadoDetalle> = _estado.asStateFlow()

    init {
        cargar()
    }

    fun cargar() {
        viewModelScope.launch {
            _estado.update { it.copy(cargando = true, error = null) }

            when (val ficha = repo.detalle(slug)) {
                is Resultado.Error -> {
                    _estado.update { it.copy(cargando = false, error = ficha.mensaje) }
                }

                is Resultado.Ok -> {
                    // El calendario se pide después porque necesita el id, que
                    // sólo se conoce tras cargar la ficha. Si falla, la ficha
                    // se enseña igual: es información secundaria.
                    val ocupados = async { repo.ocupados(ficha.valor.id) }.await()

                    _estado.update {
                        it.copy(
                            cargando = false,
                            alojamiento = ficha.valor,
                            ocupados = (ocupados as? Resultado.Ok)?.valor ?: emptyList(),
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun PantallaDetalle(vm: DetalleVM, onReservar: (Alojamiento) -> Unit) {
    val estado by vm.estado.collectAsState()

    when {
        estado.cargando -> Cargando()
        estado.error != null -> ErrorConReintento(estado.error!!, vm::cargar)
        estado.alojamiento == null -> Vacio("No disponible", "Este alojamiento ya no está publicado.")

        else -> {
            val alojamiento = estado.alojamiento!!

            Box(Modifier.fillMaxSize()) {
                Column(
                    Modifier
                        .fillMaxSize()
                        .verticalScroll(rememberScrollState())
                        // Hueco para la barra fija de abajo, o el último
                        // párrafo queda tapado por el botón de reservar.
                        .padding(bottom = 96.dp),
                ) {
                    Foto(
                        url = alojamiento.fotoPrincipal,
                        descripcion = alojamiento.title,
                        radio = 0,
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(280.dp),
                    )

                    Column(Modifier.padding(20.dp)) {
                        Text(alojamiento.title, style = MaterialTheme.typography.headlineSmall)

                        alojamiento.location?.resumen?.takeIf { it.isNotBlank() }?.let {
                            Spacer(Modifier.height(4.dp))
                            Text(
                                it,
                                style = MaterialTheme.typography.bodyLarge,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }

                        if (alojamiento.reviewsCount > 0) {
                            Spacer(Modifier.height(8.dp))
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Icon(Icons.Default.Star, null, Modifier.size(16.dp))
                                Spacer(Modifier.width(4.dp))
                                Text(
                                    "${String.format(java.util.Locale.US, "%.1f", alojamiento.ratingAvg)} · " +
                                        "${alojamiento.reviewsCount} reseñas",
                                    style = MaterialTheme.typography.bodyMedium,
                                )
                            }
                        }

                        Spacer(Modifier.height(16.dp))
                        HorizontalDivider()
                        Spacer(Modifier.height(16.dp))

                        Text(
                            "${alojamiento.maxGuests} huéspedes · " +
                                "${alojamiento.bedrooms} dormitorios · " +
                                "${alojamiento.bathrooms} baños",
                            style = MaterialTheme.typography.bodyLarge,
                        )

                        val texto = alojamiento.description ?: alojamiento.shortDescription
                        if (!texto.isNullOrBlank()) {
                            Spacer(Modifier.height(16.dp))
                            Text(texto, style = MaterialTheme.typography.bodyMedium)
                        }

                        if (estado.ocupados.isNotEmpty()) {
                            Spacer(Modifier.height(24.dp))
                            Text("Fechas no disponibles", style = MaterialTheme.typography.titleMedium)
                            Spacer(Modifier.height(8.dp))

                            // Sólo los seis rangos más cercanos. La lista
                            // completa puede traer un año entero y aquí no
                            // aporta: para elegir fechas ya está el buscador.
                            estado.ocupados
                                .sortedBy { it.from }
                                .filter { it.to.take(10) >= LocalDate.now().toString() }
                                .take(6)
                                .forEach { rango ->
                                    Text(
                                        "· Del ${fecha(rango.from)} al ${fecha(rango.to)}",
                                        style = MaterialTheme.typography.bodyMedium,
                                        color = MaterialTheme.colorScheme.onSurfaceVariant,
                                    )
                                }
                        }
                    }
                }

                // Barra fija: el precio y la acción siempre a la vista.
                Surface(
                    tonalElevation = 3.dp,
                    shadowElevation = 8.dp,
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth(),
                ) {
                    Row(
                        Modifier
                            .navigationBarsPadding()
                            .padding(horizontal = 20.dp, vertical = 14.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        Column(Modifier.weight(1f)) {
                            Text(soles(alojamiento.precio), style = MaterialTheme.typography.titleMedium)
                            Text(
                                "por noche",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant,
                            )
                        }

                        Button(onClick = { onReservar(alojamiento) }) {
                            Text("Reservar")
                        }
                    }
                }
            }
        }
    }
}
