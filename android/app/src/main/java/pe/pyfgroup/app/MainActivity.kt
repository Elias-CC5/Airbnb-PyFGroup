package pe.pyfgroup.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.DateRange
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import pe.pyfgroup.app.data.Repositorio
import pe.pyfgroup.app.ui.screens.*
import pe.pyfgroup.app.ui.theme.TemaPyf

/** Rutas de la app. En un objeto para no repartir cadenas sueltas por el código. */
private object Ruta {
    const val CATALOGO = "catalogo"
    const val RESERVAS = "reservas"
    const val ACCESO = "acceso"
    const val DETALLE = "detalle/{slug}"
    const val RESERVAR = "reservar/{id}/{titulo}/{maxHuespedes}"

    fun detalle(slug: String) = "detalle/$slug"
    fun reservar(id: String, titulo: String, max: Int) =
        "reservar/$id/${android.net.Uri.encode(titulo)}/$max"
}

/**
 * Fábrica de ViewModels.
 *
 * Compose crea los ViewModels por reflexión y sólo sabe llamar al constructor
 * vacío. Como los nuestros reciben el repositorio (y a veces un id), hace falta
 * esta fábrica para dárselos.
 */
private class Fabrica(private val crear: () -> ViewModel) : ViewModelProvider.Factory {
    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T = crear() as T
}

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        // Dibuja bajo las barras del sistema, como espera Android moderno.
        enableEdgeToEdge()

        val repo = (application as PyfApp).repositorio

        setContent {
            TemaPyf {
                App(repo)
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun App(repo: Repositorio) {
    val nav = rememberNavController()
    val entrada by nav.currentBackStackEntryAsState()
    val rutaActual = entrada?.destination?.route

    // La barra inferior sólo en las dos secciones principales. En detalle,
    // reserva o acceso estorba: ahí la persona está en una tarea.
    val conPestanas = rutaActual == Ruta.CATALOGO || rutaActual == Ruta.RESERVAS

    Scaffold(
        topBar = {
            if (!conPestanas && rutaActual != null) {
                TopAppBar(
                    title = { },
                    navigationIcon = {
                        IconButton(onClick = { nav.popBackStack() }) {
                            Icon(Icons.Default.ArrowBack, contentDescription = "Volver")
                        }
                    },
                )
            }
        },
        bottomBar = {
            if (conPestanas) {
                NavigationBar {
                    NavigationBarItem(
                        selected = rutaActual == Ruta.CATALOGO,
                        onClick = { irA(nav, Ruta.CATALOGO) },
                        icon = { Icon(Icons.Default.Search, contentDescription = null) },
                        label = { Text("Buscar") },
                    )
                    NavigationBarItem(
                        selected = rutaActual == Ruta.RESERVAS,
                        onClick = { irA(nav, Ruta.RESERVAS) },
                        icon = { Icon(Icons.Default.DateRange, contentDescription = null) },
                        label = { Text("Mis reservas") },
                    )
                }
            }
        },
    ) { relleno ->
        NavHost(
            navController = nav,
            startDestination = Ruta.CATALOGO,
            modifier = Modifier.padding(relleno),
        ) {
            composable(Ruta.CATALOGO) {
                val vm: CatalogoVM = viewModel(factory = Fabrica { CatalogoVM(repo) })
                PantallaCatalogo(vm) { slug -> nav.navigate(Ruta.detalle(slug)) }
            }

            composable(Ruta.DETALLE) { entry ->
                val slug = entry.arguments?.getString("slug").orEmpty()
                val vm: DetalleVM = viewModel(factory = Fabrica { DetalleVM(repo, slug) })

                PantallaDetalle(vm) { alojamiento ->
                    nav.navigate(
                        Ruta.reservar(alojamiento.id, alojamiento.title, alojamiento.maxGuests),
                    )
                }
            }

            composable(Ruta.RESERVAR) { entry ->
                val id = entry.arguments?.getString("id").orEmpty()
                val titulo = entry.arguments?.getString("titulo").orEmpty()
                val max = entry.arguments?.getString("maxHuespedes")?.toIntOrNull() ?: 1

                val vm: ReservaVM = viewModel(factory = Fabrica { ReservaVM(repo, id, max) })

                PantallaReservar(vm, titulo) {
                    // Al terminar se vuelve a la lista de reservas, no atrás:
                    // ahí es donde la persona quiere ver el resultado.
                    nav.navigate(Ruta.RESERVAS) {
                        popUpTo(Ruta.CATALOGO)
                    }
                }
            }

            composable(Ruta.RESERVAS) {
                val vm: ReservasVM = viewModel(factory = Fabrica { ReservasVM(repo) })
                PantallaReservas(vm) { nav.navigate(Ruta.ACCESO) }
            }

            composable(Ruta.ACCESO) {
                val vm: AccesoVM = viewModel(factory = Fabrica { AccesoVM(repo) })
                PantallaAcceso(vm) {
                    // Tras entrar, la pantalla de acceso se quita de la pila:
                    // el botón de atrás no debe devolver al formulario.
                    nav.navigate(Ruta.RESERVAS) { popUpTo(Ruta.ACCESO) { inclusive = true } }
                }
            }
        }
    }
}

/**
 * Cambio de pestaña sin apilar duplicados. Sin esto, alternar entre las dos
 * secciones diez veces deja diez entradas en la pila y el botón de atrás tarda
 * diez pulsaciones en salir.
 */
private fun irA(nav: NavHostController, ruta: String) {
    nav.navigate(ruta) {
        popUpTo(nav.graph.startDestinationId) { saveState = true }
        launchSingleTop = true
        restoreState = true
    }
}
