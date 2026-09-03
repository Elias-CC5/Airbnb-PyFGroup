package pe.pyfgroup.app

import android.app.Application
import pe.pyfgroup.app.core.net.AlmacenSesion
import pe.pyfgroup.app.core.net.Red
import pe.pyfgroup.app.data.Repositorio

/**
 * Punto de arranque y contenedor de dependencias.
 *
 * Sin Hilt ni Koin a propósito: esta app tiene tres dependencias y un solo
 * grafo. Una librería de inyección aquí añadiría anotaciones, procesamiento en
 * compilación y una curva de aprendizaje a cambio de nada. Cuando el proyecto
 * crezca y aparezcan ámbitos por pantalla, entonces sí toca.
 */
class PyfApp : Application() {

    lateinit var repositorio: Repositorio
        private set

    override fun onCreate() {
        super.onCreate()
        val sesion = AlmacenSesion(this)
        repositorio = Repositorio(Red.api(sesion), sesion, Red.json)
    }
}
