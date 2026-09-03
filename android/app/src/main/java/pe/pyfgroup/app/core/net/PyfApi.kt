package pe.pyfgroup.app.core.net

import pe.pyfgroup.app.core.model.Alojamiento
import pe.pyfgroup.app.core.model.ConsultaDisponibilidad
import pe.pyfgroup.app.core.model.Cotizacion
import pe.pyfgroup.app.core.model.CredencialesLogin
import pe.pyfgroup.app.core.model.DatosRegistro
import pe.pyfgroup.app.core.model.NuevaReserva
import pe.pyfgroup.app.core.model.Pagina
import pe.pyfgroup.app.core.model.RangoOcupado
import pe.pyfgroup.app.core.model.Reserva
import pe.pyfgroup.app.core.model.Sesion
import pe.pyfgroup.app.core.model.Usuario
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * La API del backend, tal cual la expone NestJS bajo /api/v1.
 *
 * Sólo están los endpoints que usa la app de huéspedes. Los de administración
 * y anfitrión existen en el backend pero no se declaran aquí: lo que no se
 * declara no se puede llamar por error.
 */
interface PyfApi {

    // ------------------------------ sesión ------------------------------

    @POST("auth/login")
    suspend fun login(@Body credenciales: CredencialesLogin): Sesion

    @POST("auth/register")
    suspend fun registrar(@Body datos: DatosRegistro): Sesion

    @GET("auth/me")
    suspend fun yo(): Usuario

    // --------------------------- alojamientos ---------------------------

    @GET("properties")
    suspend fun buscar(
        @Query("q") texto: String? = null,
        @Query("departmentId") departamentoId: Int? = null,
        @Query("guests") huespedes: Int? = null,
        @Query("minPrice") precioMin: Int? = null,
        @Query("maxPrice") precioMax: Int? = null,
        @Query("checkIn") entrada: String? = null,
        @Query("checkOut") salida: String? = null,
        @Query("sort") orden: String? = null,
        @Query("page") pagina: Int = 1,
        @Query("limit") limite: Int = 12,
    ): Pagina<Alojamiento>

    @GET("properties/featured")
    suspend fun destacados(@Query("limit") limite: Int = 8): List<Alojamiento>

    @GET("properties/slug/{slug}")
    suspend fun porSlug(@Path("slug") slug: String): Alojamiento

    @GET("properties/slug/{slug}/similar")
    suspend fun similares(
        @Path("slug") slug: String,
        @Query("limit") limite: Int = 4,
    ): List<Alojamiento>

    // -------------------------- disponibilidad --------------------------

    @GET("availability/properties/{id}/occupied")
    suspend fun ocupados(
        @Path("id") id: String,
        @Query("months") meses: Int = 12,
    ): List<RangoOcupado>

    @POST("availability/properties/{id}/check")
    suspend fun cotizar(
        @Path("id") id: String,
        @Body consulta: ConsultaDisponibilidad,
    ): Cotizacion

    // ----------------------------- reservas -----------------------------

    @POST("reservations")
    suspend fun reservar(@Body reserva: NuevaReserva): Reserva

    @GET("reservations/me")
    suspend fun misReservas(): List<Reserva>

    @PATCH("reservations/{id}/cancel")
    suspend fun cancelar(@Path("id") id: String): Reserva
}
