package pe.pyfgroup.app.core.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

/*
  Espejo de lo que devuelve la API de NestJS.

  Todos los campos que el backend puede omitir van con valor por defecto. Es a
  propósito: kotlinx.serialization revienta si falta un campo obligatorio, y una
  excepción al parsear tumba la pantalla entera. Con defaults, un campo nuevo o
  ausente degrada en vez de romper.

  `pricePerNight` llega como cadena y no como número porque en Postgres es un
  Decimal y Prisma lo serializa así para no perder precisión. Se convierte al
  usarlo, nunca antes.
*/

@Serializable
data class Imagen(
    val id: String = "",
    val url: String = "",
    val alt: String? = null,
    val isMain: Boolean = false,
    val order: Int = 0,
)

@Serializable
data class Referencia(
    val id: Int? = null,
    val name: String = "",
    val slug: String? = null,
)

@Serializable
data class Ubicacion(
    val latitude: Double? = null,
    val longitude: Double? = null,
    val department: Referencia? = null,
    val province: Referencia? = null,
    val district: Referencia? = null,
) {
    /** "Miraflores, Lima" — lo que se enseña bajo el título. */
    val resumen: String
        get() = listOfNotNull(district?.name, department?.name)
            .filter { it.isNotBlank() }
            .joinToString(", ")
}

@Serializable
data class Alojamiento(
    val id: String,
    val title: String = "",
    val slug: String = "",
    val shortDescription: String? = null,
    val description: String? = null,
    val pricePerNight: String = "0",
    val currency: String = "PEN",
    val maxGuests: Int = 1,
    val bedrooms: Int = 0,
    val bathrooms: Int = 0,
    val ratingAvg: Double = 0.0,
    val reviewsCount: Int = 0,
    val isFeatured: Boolean = false,
    val images: List<Imagen> = emptyList(),
    val location: Ubicacion? = null,
    val category: Referencia? = null,
) {
    val precio: Double get() = pricePerNight.toDoubleOrNull() ?: 0.0

    /** La principal si está marcada; si no, la primera que haya. */
    val fotoPrincipal: String?
        get() = images.firstOrNull { it.isMain }?.url ?: images.firstOrNull()?.url
}

@Serializable
data class Paginacion(
    val page: Int = 1,
    val limit: Int = 12,
    val total: Int = 0,
    val totalPages: Int = 1,
    val hasNext: Boolean = false,
    val hasPrev: Boolean = false,
)

@Serializable
data class Pagina<T>(
    val data: List<T> = emptyList(),
    val meta: Paginacion = Paginacion(),
)

// ------------------------------- sesión -------------------------------

@Serializable
data class Usuario(
    val id: String,
    val email: String = "",
    val firstName: String = "",
    val lastName: String = "",
    val role: String = "USER",
) {
    val nombreCompleto: String get() = "$firstName $lastName".trim()
}

@Serializable
data class Tokens(
    val accessToken: String,
    val refreshToken: String,
    val expiresIn: Long = 0,
)

@Serializable
data class Sesion(
    val user: Usuario,
    val tokens: Tokens,
)

@Serializable
data class CredencialesLogin(val email: String, val password: String)

@Serializable
data class DatosRegistro(
    val firstName: String,
    val lastName: String,
    val email: String,
    val password: String,
    val phone: String? = null,
)

@Serializable
data class PeticionRefresh(val refreshToken: String)

// ----------------------------- disponibilidad -----------------------------

@Serializable
data class RangoOcupado(
    val from: String = "",
    val to: String = "",
    val type: String = "reservation",
)

@Serializable
data class ConsultaDisponibilidad(
    val checkIn: String,
    val checkOut: String,
    val guests: Int = 1,
)

@Serializable
data class Cotizacion(
    val available: Boolean = false,
    val reason: String? = null,
    val nights: Int = 0,
    val pricePerNight: Double = 0.0,
    val cleaningFee: Double = 0.0,
    val subtotal: Double = 0.0,
    val total: Double = 0.0,
    val currency: String = "PEN",
)

// ------------------------------- reservas -------------------------------

@Serializable
data class NuevaReserva(
    val propertyId: String,
    val checkIn: String,
    val checkOut: String,
    val guests: Int,
    val notes: String? = null,
)

@Serializable
data class Reserva(
    val id: String,
    val code: String = "",
    val checkIn: String = "",
    val checkOut: String = "",
    val nights: Int = 0,
    val guests: Int = 1,
    val totalPrice: String = "0",
    val currency: String = "PEN",
    val status: String = "PENDING",
    val notes: String? = null,
    val property: Alojamiento? = null,
) {
    val total: Double get() = totalPrice.toDoubleOrNull() ?: 0.0

    /** Etiqueta en castellano para la interfaz. */
    val estado: String
        get() = when (status) {
            "PENDING" -> "Pendiente"
            "CONFIRMED" -> "Confirmada"
            "CANCELLED" -> "Cancelada"
            "COMPLETED" -> "Completada"
            "REJECTED" -> "Rechazada"
            else -> status
        }
}

/**
 * Forma de los errores de NestJS. `message` puede venir como texto suelto o
 * como lista cuando falla la validación de varios campos a la vez, así que se
 * recoge en crudo y se normaliza al leerlo.
 */
@Serializable
data class ErrorApi(
    val statusCode: Int = 0,
    @SerialName("message") val mensaje: kotlinx.serialization.json.JsonElement? = null,
    val error: String? = null,
)
