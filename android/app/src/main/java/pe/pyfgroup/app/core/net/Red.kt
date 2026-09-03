package pe.pyfgroup.app.core.net

import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import okhttp3.Interceptor
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.logging.HttpLoggingInterceptor
import pe.pyfgroup.app.BuildConfig
import pe.pyfgroup.app.core.model.PeticionRefresh
import pe.pyfgroup.app.core.model.Sesion
import retrofit2.Retrofit
import retrofit2.converter.kotlinx.serialization.asConverterFactory
import java.util.concurrent.TimeUnit

/**
 * Rutas que nunca deben llevar el token de acceso ni intentar renovarlo.
 * Meter el header en /auth/refresh crearía un bucle: falla el token, se intenta
 * refrescar, el refresco vuelve a llevar el token caducado, vuelve a fallar.
 */
private val SIN_TOKEN = listOf("auth/login", "auth/register", "auth/refresh", "auth/forgot-password")

private fun Request.esPublica(): Boolean =
    SIN_TOKEN.any { url.encodedPath.contains(it) }

/** Añade el token de acceso a todas las llamadas que lo necesitan. */
class InterceptorAuth(private val sesion: AlmacenSesion) : Interceptor {
    override fun intercept(chain: Interceptor.Chain): Response {
        val peticion = chain.request()
        if (peticion.esPublica()) return chain.proceed(peticion)

        val token = sesion.accessTokenBloqueante() ?: return chain.proceed(peticion)

        return chain.proceed(
            peticion.newBuilder().header("Authorization", "Bearer $token").build(),
        )
    }
}

/**
 * Renueva el token cuando el backend responde 401 y reintenta la llamada.
 *
 * El token de acceso dura poco a propósito, así que esto se dispara a menudo y
 * el usuario no debe notarlo. Tres detalles que importan:
 *
 * - Está sincronizado. Si cuatro pantallas piden datos a la vez y las cuatro
 *   reciben 401, sin el candado harían cuatro refrescos en paralelo. Como el
 *   backend ROTA el refresh token en cada uso, el primero invalidaría a los
 *   otros tres y acabaría cerrando la sesión.
 * - Antes de refrescar comprueba si otro hilo ya lo hizo: si el token guardado
 *   cambió, reintenta con el nuevo sin pedir nada.
 * - Sólo lo intenta una vez por petición. Si el reintento también da 401, se
 *   cierra la sesión: insistir sería un bucle infinito.
 */
class RenovadorSesion(
    private val sesion: AlmacenSesion,
    private val json: Json,
) : okhttp3.Authenticator {

    private val candado = Any()

    override fun authenticate(route: okhttp3.Route?, response: Response): Request? {
        if (response.request.esPublica()) return null

        // `priorResponse` encadena los reintentos previos. Si ya hubo uno, parar.
        if (response.priorResponse != null) {
            sesion.limpiarBloqueante()
            return null
        }

        val usado = response.request.header("Authorization")?.removePrefix("Bearer ")?.trim()

        synchronized(candado) {
            val actual = sesion.accessTokenBloqueante()

            // Otro hilo ya refrescó mientras esperábamos el candado.
            if (actual != null && actual != usado) {
                return response.request.newBuilder()
                    .header("Authorization", "Bearer $actual")
                    .build()
            }

            val refresco = sesion.refreshTokenBloqueante() ?: return null
            val nuevos = renovar(refresco) ?: run {
                sesion.limpiarBloqueante()
                return null
            }

            sesion.guardarBloqueante(nuevos.tokens)

            return response.request.newBuilder()
                .header("Authorization", "Bearer ${nuevos.tokens.accessToken}")
                .build()
        }
    }

    /**
     * Cliente aparte, sin interceptores. Reutilizar el principal metería esta
     * llamada por el mismo camino que acaba de fallar.
     */
    private fun renovar(refreshToken: String): Sesion? = runCatching {
        val cuerpo = json.encodeToString(PeticionRefresh(refreshToken))
            .toRequestBody("application/json".toMediaType())

        val peticion = Request.Builder()
            .url("${BuildConfig.API_BASE_URL}auth/refresh")
            .post(cuerpo)
            .build()

        OkHttpClient().newCall(peticion).execute().use { respuesta ->
            if (!respuesta.isSuccessful) return null
            val texto = respuesta.body?.string() ?: return null
            json.decodeFromString<Sesion>(texto)
        }
    }.getOrNull()
}

private fun String.toRequestBody(tipo: okhttp3.MediaType) =
    okhttp3.RequestBody.create(tipo, this)

/** Construye el cliente HTTP y la interfaz de la API. */
object Red {

    val json = Json {
        // Si el backend añade un campo, la app no debe romperse.
        ignoreUnknownKeys = true
        coerceInputValues = true
        explicitNulls = false
    }

    fun api(sesion: AlmacenSesion): PyfApi {
        val registro = HttpLoggingInterceptor().apply {
            // Los cuerpos llevan tokens y datos personales: sólo en debug.
            level = if (BuildConfig.LOG_HTTP) HttpLoggingInterceptor.Level.BODY
            else HttpLoggingInterceptor.Level.NONE
        }

        val cliente = OkHttpClient.Builder()
            .addInterceptor(InterceptorAuth(sesion))
            .addInterceptor(registro)
            .authenticator(RenovadorSesion(sesion, json))
            // Render duerme los servicios inactivos en los planes bajos y el
            // primer arranque puede tardar. Con 10s por defecto, ese primer
            // visitante vería un error que no es tal.
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(60, TimeUnit.SECONDS)
            .build()

        return Retrofit.Builder()
            .baseUrl(BuildConfig.API_BASE_URL)
            .client(cliente)
            .addConverterFactory(json.asConverterFactory("application/json".toMediaType()))
            .build()
            .create(PyfApi::class.java)
    }
}
