package pe.pyfgroup.app.core.net

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.encodeToString
import kotlinx.serialization.json.Json
import pe.pyfgroup.app.core.model.Tokens
import pe.pyfgroup.app.core.model.Usuario

private val Context.almacen by preferencesDataStore("sesion")

/**
 * Guarda la sesión entre arranques de la app.
 *
 * Sobre dónde viven los tokens: en la web el refresh token va en una cookie
 * HttpOnly, que el JavaScript de la página no puede leer. En Android no existe
 * ese mecanismo, así que se guardan en DataStore, dentro del almacenamiento
 * privado de la app. Otra app no puede leerlo salvo en un teléfono rooteado.
 *
 * Para una versión posterior conviene cifrarlos con la Keystore del sistema,
 * que ata la clave al hardware del teléfono. No está aquí para no complicar el
 * arranque, pero queda anotado: es lo que separa "razonable" de "correcto".
 */
class AlmacenSesion(private val contexto: Context) {

    private val json = Json { ignoreUnknownKeys = true }

    private val claveAcceso = stringPreferencesKey("access_token")
    private val claveRefresco = stringPreferencesKey("refresh_token")
    private val claveUsuario = stringPreferencesKey("usuario")

    val usuario: Flow<Usuario?> = contexto.almacen.data.map { prefs ->
        prefs[claveUsuario]?.let { runCatching { json.decodeFromString<Usuario>(it) }.getOrNull() }
    }

    suspend fun guardar(tokens: Tokens, usuario: Usuario?) {
        contexto.almacen.edit { prefs ->
            prefs[claveAcceso] = tokens.accessToken
            prefs[claveRefresco] = tokens.refreshToken
            if (usuario != null) prefs[claveUsuario] = json.encodeToString(usuario)
        }
    }

    suspend fun limpiar() {
        contexto.almacen.edit { it.clear() }
    }

    suspend fun accessToken(): String? = contexto.almacen.data.first()[claveAcceso]

    suspend fun refreshToken(): String? = contexto.almacen.data.first()[claveRefresco]

    /*
      Los dos siguientes bloquean el hilo a propósito.

      OkHttp llama a los interceptores desde su propio hilo de red, que no es
      de coroutines y no puede suspender. Leer DataStore es una operación de
      microsegundos sobre un fichero pequeño, y ese hilo ya está esperando por
      la red de todas formas. La alternativa —mantener una copia en memoria—
      abre la puerta a que se desincronice tras un refresco.
    */
    fun accessTokenBloqueante(): String? = runBlocking { accessToken() }

    fun refreshTokenBloqueante(): String? = runBlocking { refreshToken() }

    fun guardarBloqueante(tokens: Tokens) = runBlocking { guardar(tokens, null) }

    fun limpiarBloqueante() = runBlocking { limpiar() }
}
