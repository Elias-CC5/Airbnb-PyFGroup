package pe.pyfgroup.app.ui.screens

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Star
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import pe.pyfgroup.app.core.model.Alojamiento
import pe.pyfgroup.app.data.Repositorio
import pe.pyfgroup.app.data.Resultado
import pe.pyfgroup.app.ui.*

data class EstadoCatalogo(
    val cargando: Boolean = true,
    val alojamientos: List<Alojamiento> = emptyList(),
    val error: String? = null,
    val busqueda: String = "",
    val pagina: Int = 1,
    val hayMas: Boolean = false,
    val cargandoMas: Boolean = false,
)

class CatalogoVM(private val repo: Repositorio) : ViewModel() {

    private val _estado = MutableStateFlow(EstadoCatalogo())
    val estado: StateFlow<EstadoCatalogo> = _estado.asStateFlow()

    /** La búsqueda en curso, para poder cancelarla si el texto cambia. */
    private var enCurso: Job? = null

    init {
        cargar()
    }

    fun buscar(texto: String) {
        _estado.update { it.copy(busqueda = texto) }

        // Espera a que la persona deje de escribir. Sin esto se lanzaría una
        // petición por cada letra, y llegarían desordenadas.
        enCurso?.cancel()
        enCurso = viewModelScope.launch {
            delay(350)
            cargar()
        }
    }

    fun cargar() {
        viewModelScope.launch {
            _estado.update { it.copy(cargando = true, error = null, pagina = 1) }

            when (val r = repo.buscar(texto = _estado.value.busqueda, pagina = 1)) {
                is Resultado.Ok -> _estado.update {
                    it.copy(
                        cargando = false,
                        alojamientos = r.valor.data,
                        hayMas = r.valor.meta.hasNext,
                    )
                }

                is Resultado.Error -> _estado.update {
                    it.copy(cargando = false, error = r.mensaje)
                }
            }
        }
    }

    /** Paginación al llegar al final. Añade, no reemplaza. */
    fun cargarMas() {
        val actual = _estado.value
        if (actual.cargandoMas || !actual.hayMas) return

        viewModelScope.launch {
            _estado.update { it.copy(cargandoMas = true) }
            val siguiente = actual.pagina + 1

            when (val r = repo.buscar(texto = actual.busqueda, pagina = siguiente)) {
                is Resultado.Ok -> _estado.update {
                    it.copy(
                        cargandoMas = false,
                        pagina = siguiente,
                        alojamientos = it.alojamientos + r.valor.data,
                        hayMas = r.valor.meta.hasNext,
                    )
                }
                // Un fallo paginando no debe borrar lo que ya se ve.
                is Resultado.Error -> _estado.update { it.copy(cargandoMas = false, hayMas = false) }
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PantallaCatalogo(vm: CatalogoVM, onAbrir: (String) -> Unit) {
    val estado by vm.estado.collectAsState()

    Column(Modifier.fillMaxSize()) {
        OutlinedTextField(
            value = estado.busqueda,
            onValueChange = vm::buscar,
            placeholder = { Text("Buscar por distrito o nombre") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
            singleLine = true,
            shape = MaterialTheme.shapes.extraLarge,
            modifier = Modifier
                .fillMaxWidth()
                .padding(horizontal = 16.dp, vertical = 12.dp),
        )

        when {
            estado.cargando -> Cargando()

            estado.error != null -> ErrorConReintento(estado.error!!, vm::cargar)

            estado.alojamientos.isEmpty() -> Vacio(
                "Sin resultados",
                "No encontramos alojamientos con esa búsqueda. Prueba con otro distrito.",
            )

            else -> LazyColumn(
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(20.dp),
            ) {
                items(estado.alojamientos, key = { it.id }) { alojamiento ->
                    TarjetaAlojamiento(alojamiento) { onAbrir(alojamiento.slug) }
                }

                if (estado.hayMas) {
                    item {
                        // Al componerse este elemento significa que se llegó al
                        // final de la lista: es el disparador de la paginación.
                        LaunchedEffect(estado.pagina) { vm.cargarMas() }
                        Box(
                            Modifier
                                .fillMaxWidth()
                                .padding(16.dp),
                            contentAlignment = Alignment.Center,
                        ) {
                            CircularProgressIndicator(strokeWidth = 2.dp)
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun TarjetaAlojamiento(alojamiento: Alojamiento, onClick: () -> Unit) {
    Column(Modifier.clickable(onClick = onClick)) {
        Foto(
            url = alojamiento.fotoPrincipal,
            descripcion = alojamiento.title,
            modifier = Modifier
                .fillMaxWidth()
                .height(220.dp),
        )

        Spacer(Modifier.height(12.dp))

        Row(verticalAlignment = Alignment.CenterVertically) {
            Text(
                alojamiento.title,
                style = MaterialTheme.typography.titleMedium,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis,
                modifier = Modifier.weight(1f),
            )

            if (alojamiento.reviewsCount > 0) {
                Spacer(Modifier.width(8.dp))
                Icon(
                    Icons.Default.Star,
                    contentDescription = null,
                    modifier = Modifier.size(15.dp),
                )
                Spacer(Modifier.width(3.dp))
                Text(
                    String.format(java.util.Locale.US, "%.1f", alojamiento.ratingAvg),
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
        }

        alojamiento.location?.resumen?.takeIf { it.isNotBlank() }?.let {
            Text(
                it,
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }

        Spacer(Modifier.height(4.dp))

        Row(verticalAlignment = Alignment.Bottom) {
            Text(soles(alojamiento.precio), style = MaterialTheme.typography.titleSmall)
            Spacer(Modifier.width(4.dp))
            Text(
                "por noche",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
        }
    }
}
