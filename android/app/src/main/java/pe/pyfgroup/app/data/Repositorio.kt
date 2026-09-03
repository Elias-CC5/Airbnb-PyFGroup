package pe.pyfgroup.app.data

import kotlinx.coroutines.flow.Flow
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.jsonArray
import kotlinx.serialization.json.jsonPrimitive
import pe.pyfgroup.app.core.model.*
import pe.pyfgroup.app.core.net.AlmacenSesion
import pe.pyfgroup.app.core.net.PyfApi
import retrofit2.HttpException

/**
 * Resultado de cualquier operación que hable con la red.
 *
 * Se usa en vez de lanzar excepciones para que cada pantalla esté obligada a
 * decidir qué enseña cuando algo falla. Una excepción sin capturar en un
 * ViewModel cierra la app; esto no puede.
 */
sealed interface Resultado<out T> {
    data class Ok<T>(val valor: T) : Resultado<T>
    data class Error(val mensaje: String) : Resultado<Nothing>
}

/**
 * Traduce cualquier fallo a algo que una persona pueda leer.
 *
 * NestJS manda `message` como texto suelto o como lista cuando fallan varias
 * validaciones a la vez. Y los errores de red no traen mensaje: ahí hay que
 * poner uno que oriente en lugar de un volcado técnico.
 */
private fun traducir(e: Throwable, json: Json): String = when (e) {
    is HttpException -> {
        val cuerpo = runCatching { e.response()?.errorBody()?.string() }.getOrNull()
        val delServidor = cuerpo?.let {
            runCatching {
                val error = json.decodeFromString<ErrorApi>(it)
                when (val m = error.mensaje) {
                    null -> null
                    else -> runCatching { m.jsonArray.joinToString(" · ") { j -> j.jsonPrimitive.content } }
                        .getOrElse { runCatching { m.jsonPrimitive.content }.getOrNull() }
                }
            }.getOrNull()
        }

        delServidor ?: when (e.code()) {
            401 -> "Tu sesión expiró. Vuelve a iniciar sesión."
            403 -> "No tienes permiso para hacer esto."
            404 -> "No encontramos lo que buscabas."
            429 -> "Demasiados intentos. Espera un momento."
            in 500..599 -> "El servidor tuvo un problema. Inténtalo en unos minutos."
            else -> "No se pudo completar la operación."
        }
    }

    is java.net.UnknownHostException,
    is java.net.ConnectException,
    -> "Sin conexión. Revisa tu internet."

    is java.net.SocketTimeoutException ->
        "El servidor está tardando demasiado. Inténtalo de nuevo."

    else -> "Algo salió mal. Inténtalo de nuevo."
}

private suspend inline fun <T> pedir(json: Json, bloque: () -> T): Resultado<T> = try {
    Resultado.Ok(bloque())
} catch (e: Throwable) {
    Resultado.Error(traducir(e, json))
}

/**
 * Única puerta de entrada a los datos. Las pantallas hablan con esto, nunca
 * con Retrofit directamente: así el manejo de errores vive en un solo sitio.
 */
class Repositorio(
    private val api: PyfApi,
    private val sesion: AlmacenSesion,
    private val json: Json,
) {

    val usuario: Flow<Usuario?> = sesion.usuario

    // ------------------------------ sesión ------------------------------

    suspend fun entrar(email: String, clave: String): Resultado<Usuario> =
        pedir(json) {
            val resultado = api.login(CredencialesLogin(email.trim(), clave))
            sesion.guardar(resultado.tokens, resultado.user)
            resultado.user
        }

    suspend fun registrar(
        nombre: String,
        apellido: String,
        email: String,
        clave: String,
        telefono: String?,
    ): Resultado<Usuario> = pedir(json) {
        val resultado = api.registrar(
            DatosRegistro(
                firstName = nombre.trim(),
                lastName = apellido.trim(),
                email = email.trim(),
                password = clave,
                phone = telefono?.trim()?.takeIf { it.isNotBlank() },
            ),
        )
        sesion.guardar(resultado.tokens, resultado.user)
        resultado.user
    }

    suspend fun salir() = sesion.limpiar()

    // --------------------------- alojamientos ---------------------------

    suspend fun buscar(
        texto: String? = null,
        huespedes: Int? = null,
        pagina: Int = 1,
    ): Resultado<Pagina<Alojamiento>> = pedir(json) {
        api.buscar(
            texto = texto?.trim()?.takeIf { it.isNotBlank() },
            huespedes = huespedes,
            pagina = pagina,
        )
    }

    suspend fun destacados(): Resultado<List<Alojamiento>> = pedir(json) { api.destacados() }

    suspend fun detalle(slug: String): Resultado<Alojamiento> = pedir(json) { api.porSlug(slug) }

    // -------------------------- disponibilidad --------------------------

    suspend fun ocupados(id: String): Resultado<List<RangoOcupado>> =
        pedir(json) { api.ocupados(id) }

    suspend fun cotizar(
        id: String,
        entrada: String,
        salida: String,
        huespedes: Int,
    ): Resultado<Cotizacion> = pedir(json) {
        api.cotizar(id, ConsultaDisponibilidad(entrada, salida, huespedes))
    }

    // ----------------------------- reservas -----------------------------

    suspend fun reservar(
        alojamientoId: String,
        entrada: String,
        salida: String,
        huespedes: Int,
        notas: String?,
    ): Resultado<Reserva> = pedir(json) {
        api.reservar(
            NuevaReserva(
                propertyId = alojamientoId,
                checkIn = entrada,
                checkOut = salida,
                guests = huespedes,
                notes = notas?.takeIf { it.isNotBlank() },
            ),
        )
    }

    suspend fun misReservas(): Resultado<List<Reserva>> = pedir(json) { api.misReservas() }

    suspend fun cancelar(id: String): Resultado<Reserva> = pedir(json) { api.cancelar(id) }
}
