package pe.pyfgroup.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import pe.pyfgroup.app.core.model.Reserva
import pe.pyfgroup.app.core.model.Usuario
import pe.pyfgroup.app.data.Repositorio
import pe.pyfgroup.app.data.Resultado
import pe.pyfgroup.app.ui.*

// --------------------------------- acceso ---------------------------------

data class EstadoAcceso(
    val esRegistro: Boolean = false,
    val nombre: String = "",
    val apellido: String = "",
    val email: String = "",
    val clave: String = "",
    val telefono: String = "",
    val enviando: Boolean = false,
    val error: String? = null,
)

class AccesoVM(private val repo: Repositorio) : ViewModel() {

    private val _estado = MutableStateFlow(EstadoAcceso())
    val estado: StateFlow<EstadoAcceso> = _estado.asStateFlow()

    fun alternar() = _estado.update { it.copy(esRegistro = !it.esRegistro, error = null) }
    fun nombre(v: String) = _estado.update { it.copy(nombre = v) }
    fun apellido(v: String) = _estado.update { it.copy(apellido = v) }
    fun email(v: String) = _estado.update { it.copy(email = v) }
    fun clave(v: String) = _estado.update { it.copy(clave = v) }
    fun telefono(v: String) = _estado.update { it.copy(telefono = v) }

    fun enviar(onListo: () -> Unit) {
        val a = _estado.value
        viewModelScope.launch {
            _estado.update { it.copy(enviando = true, error = null) }

            val r = if (a.esRegistro) {
                repo.registrar(a.nombre, a.apellido, a.email, a.clave, a.telefono)
            } else {
                repo.entrar(a.email, a.clave)
            }

            when (r) {
                is Resultado.Ok -> {
                    _estado.update { it.copy(enviando = false) }
                    onListo()
                }
                is Resultado.Error -> _estado.update { it.copy(enviando = false, error = r.mensaje) }
            }
        }
    }
}

@Composable
fun PantallaAcceso(vm: AccesoVM, onListo: () -> Unit) {
    val estado by vm.estado.collectAsState()

    Column(
        Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
    ) {
        Text(
            if (estado.esRegistro) "Crear cuenta" else "Iniciar sesión",
            style = MaterialTheme.typography.headlineSmall,
        )
        Spacer(Modifier.height(6.dp))
        Text(
            "Necesitas una cuenta para reservar y seguir tus estadías.",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
        )

        Spacer(Modifier.height(28.dp))

        if (estado.esRegistro) {
            OutlinedTextField(
                value = estado.nombre,
                onValueChange = vm::nombre,
                label = { Text("Nombre") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = estado.apellido,
                onValueChange = vm::apellido,
                label = { Text("Apellido") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(12.dp))
            OutlinedTextField(
                value = estado.telefono,
                onValueChange = vm::telefono,
                label = { Text("Teléfono (opcional)") },
                singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                modifier = Modifier.fillMaxWidth(),
            )
            Spacer(Modifier.height(12.dp))
        }

        OutlinedTextField(
            value = estado.email,
            onValueChange = vm::email,
            label = { Text("Correo") },
            singleLine = true,
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Email,
                imeAction = ImeAction.Next,
            ),
            modifier = Modifier.fillMaxWidth(),
        )

        Spacer(Modifier.height(12.dp))

        OutlinedTextField(
            value = estado.clave,
            onValueChange = vm::clave,
            label = { Text("Contraseña") },
            singleLine = true,
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(
                keyboardType = KeyboardType.Password,
                imeAction = ImeAction.Done,
            ),
            modifier = Modifier.fillMaxWidth(),
        )

        estado.error?.let {
            Spacer(Modifier.height(16.dp))
            Text(it, color = MaterialTheme.colorScheme.error, style = MaterialTheme.typography.bodyMedium)
        }

        Spacer(Modifier.height(24.dp))

        Button(
            onClick = { vm.enviar(onListo) },
            enabled = !estado.enviando && estado.email.isNotBlank() && estado.clave.isNotBlank(),
            modifier = Modifier.fillMaxWidth(),
        ) {
            if (estado.enviando) CircularProgressIndicator(Modifier.size(18.dp), strokeWidth = 2.dp)
            else Text(if (estado.esRegistro) "Crear cuenta" else "Entrar")
        }

        Spacer(Modifier.height(12.dp))

        TextButton(onClick = vm::alternar, modifier = Modifier.align(Alignment.CenterHorizontally)) {
            Text(
                if (estado.esRegistro) "Ya tengo cuenta" else "No tengo cuenta, quiero registrarme",
            )
        }
    }
}

// ------------------------------ mis reservas ------------------------------

data class EstadoReservas(
    val cargando: Boolean = true,
    val reservas: List<Reserva> = emptyList(),
    val error: String? = null,
)

class ReservasVM(private val repo: Repositorio) : ViewModel() {

    private val _estado = MutableStateFlow(EstadoReservas())
    val estado: StateFlow<EstadoReservas> = _estado.asStateFlow()

    val usuario = repo.usuario

    init {
        cargar()
    }

    fun cargar() {
        viewModelScope.launch {
            _estado.update { it.copy(cargando = true, error = null) }
            when (val r = repo.misReservas()) {
                is Resultado.Ok -> _estado.update { it.copy(cargando = false, reservas = r.valor) }
                is Resultado.Error -> _estado.update { it.copy(cargando = false, error = r.mensaje) }
            }
        }
    }

    fun cancelar(id: String) {
        viewModelScope.launch {
            when (repo.cancelar(id)) {
                // Se recarga en vez de tocar la lista a mano: el backend puede
                // cambiar más cosas que el estado, como el importe devuelto.
                is Resultado.Ok -> cargar()
                is Resultado.Error -> Unit
            }
        }
    }

    fun salir(onListo: () -> Unit) {
        viewModelScope.launch {
            repo.salir()
            onListo()
        }
    }
}

@Composable
fun PantallaReservas(vm: ReservasVM, onEntrar: () -> Unit) {
    val estado by vm.estado.collectAsState()
    val usuario by vm.usuario.collectAsState(initial = null)

    if (usuario == null) {
        Column(
            Modifier
                .fillMaxSize()
                .padding(32.dp),
            verticalArrangement = Arrangement.Center,
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Text("Aún no has entrado", style = MaterialTheme.typography.titleMedium)
            Spacer(Modifier.height(8.dp))
            Text(
                "Inicia sesión para ver tus reservas.",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )
            Spacer(Modifier.height(20.dp))
            Button(onClick = onEntrar) { Text("Iniciar sesión") }
        }
        return
    }

    Column(Modifier.fillMaxSize()) {
        CabeceraCuenta(usuario!!) { vm.salir(onEntrar) }

        when {
            estado.cargando -> Cargando()
            estado.error != null -> ErrorConReintento(estado.error!!, vm::cargar)
            estado.reservas.isEmpty() -> Vacio(
                "Sin reservas todavía",
                "Cuando reserves un alojamiento, aparecerá aquí.",
            )

            else -> LazyColumn(
                contentPadding = PaddingValues(16.dp),
                verticalArrangement = Arrangement.spacedBy(12.dp),
            ) {
                items(estado.reservas, key = { it.id }) { reserva ->
                    TarjetaReserva(reserva) { vm.cancelar(reserva.id) }
                }
            }
        }
    }
}

@Composable
private fun CabeceraCuenta(usuario: Usuario, onSalir: () -> Unit) {
    Surface(tonalElevation = 1.dp) {
        Row(
            Modifier
                .fillMaxWidth()
                .padding(20.dp),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Column(Modifier.weight(1f)) {
                Text(usuario.nombreCompleto, style = MaterialTheme.typography.titleMedium)
                Text(
                    usuario.email,
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant,
                )
            }
            TextButton(onClick = onSalir) { Text("Salir") }
        }
    }
}

@Composable
private fun TarjetaReserva(reserva: Reserva, onCancelar: () -> Unit) {
    var confirmando by remember { mutableStateOf(false) }

    OutlinedCard(Modifier.fillMaxWidth()) {
        Column(Modifier.padding(16.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    reserva.property?.title ?: "Alojamiento",
                    style = MaterialTheme.typography.titleSmall,
                    modifier = Modifier.weight(1f),
                )
                Insignia(
                    reserva.estado,
                    when (reserva.status) {
                        "CONFIRMED" -> MaterialTheme.colorScheme.primary
                        "CANCELLED", "REJECTED" -> MaterialTheme.colorScheme.error
                        else -> MaterialTheme.colorScheme.onSurfaceVariant
                    },
                )
            }

            Spacer(Modifier.height(8.dp))

            Text(
                "${fecha(reserva.checkIn)} → ${fecha(reserva.checkOut)}",
                style = MaterialTheme.typography.bodyMedium,
            )
            Text(
                "${reserva.nights} noches · ${reserva.guests} huéspedes · ${soles(reserva.total)}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
            )

            Text(
                "Código ${reserva.code}",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 8.dp),
            )

            // Cancelar sólo tiene sentido en lo que aún no ha pasado.
            if (reserva.status == "PENDING" || reserva.status == "CONFIRMED") {
                Spacer(Modifier.height(8.dp))
                TextButton(onClick = { confirmando = true }) { Text("Cancelar reserva") }
            }
        }
    }

    // Cancelar no se deshace: se pregunta antes.
    if (confirmando) {
        AlertDialog(
            onDismissRequest = { confirmando = false },
            title = { Text("¿Cancelar la reserva?") },
            text = { Text("Esta acción no se puede deshacer.") },
            confirmButton = {
                TextButton(onClick = {
                    confirmando = false
                    onCancelar()
                }) { Text("Sí, cancelar") }
            },
            dismissButton = {
                TextButton(onClick = { confirmando = false }) { Text("No") }
            },
        )
    }
}
