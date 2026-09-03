# PyFGroup — app Android

App nativa en Kotlin y Jetpack Compose que consume la misma API de NestJS que
la web. No es un envoltorio del sitio: habla directamente con
`https://airbnb-pyfgroup.onrender.com/api/v1`.

---

## Abrirlo

1. **Android Studio → Open** → elige esta carpeta (`android/`), no la raíz del repo.
2. Deja que sincronice Gradle. La primera vez descarga bastante; tarda.
3. Si se queja de que falta el SDK de **API 36**: `Tools → SDK Manager` →
   pestaña *SDK Platforms* → marca **Android 16 (API 36)** → Apply.
4. `Run` con un emulador o un teléfono conectado.

Requiere **JDK 17**. Android Studio trae el suyo; si compilas desde terminal,
comprueba con `java -version`.

---

## Cómo está organizado

```
app/src/main/java/pe/pyfgroup/app/
  PyfApp.kt            Arranque y contenedor de dependencias
  MainActivity.kt      Navegación y andamiaje de la interfaz
  core/model/          Modelos que reflejan las respuestas de la API
  core/net/            Cliente HTTP, sesión y renovación de token
  data/Repositorio.kt  Única puerta a los datos; traduce los errores
  ui/screens/          Catálogo, Detalle, Reservar, Acceso y Mis reservas
  ui/theme/            Paleta y tipografía, calcadas de la web
```

**Sin Hilt ni Koin.** Tres dependencias y un solo grafo no justifican una
librería de inyección. Cuando aparezcan ámbitos por pantalla, entonces sí.

---

## Dos decisiones que conviene entender

**El precio siempre lo calcula el backend.** La pantalla de reserva llama a
`availability/properties/{id}/check` y enseña lo que devuelve. Multiplicar
noches por precio en la app daría un número que puede no coincidir con el que
se cobra — y enseñar un total falso es peor que no enseñar ninguno.

**La renovación del token está sincronizada.** El backend **rota** el refresh
token en cada uso: al usarlo, el anterior queda invalidado. Si dos pantallas
recibieran un 401 a la vez y refrescaran en paralelo, la segunda usaría un
token ya quemado y cerraría la sesión. Por eso `RenovadorSesion` usa un candado
y comprueba si otro hilo ya refrescó antes de pedir nada.

---

## Lo que falta antes de Google Play

**Cuenta de desarrollador.** Vas por la de organización, así que necesitas el
**número D-U-N-S**. Es gratis pero tarda de una a cuatro semanas — empiézalo ya,
es lo único con un plazo que no controlas. A cambio te ahorras el requisito de
12 probadores durante 14 días seguidos que sí tienen las cuentas personales.

**Firma.** Play exige `.aab` y firma gestionada por Google. En Android Studio:
`Build → Generate Signed App Bundle`. Guarda el keystore y su contraseña donde
no se pierdan: sin él no puedes publicar actualizaciones nunca más.

**Política de privacidad.** Google la exige y tiene que estar en una URL
pública. Ya tienes `pyfgroup.com/privacidad` — apúntala ahí.

**Formulario de seguridad de datos.** Hay que declarar qué recoges. En esta app:
correo, nombre, teléfono opcional y las reservas. Todo va cifrado por HTTPS y
se puede pedir su borrado. Sé exacto: mentir aquí es motivo de retirada.

---

## Pendiente para una segunda versión

- **Cifrar los tokens con la Keystore del sistema.** Ahora están en DataStore,
  dentro del almacenamiento privado de la app — inaccesible para otras apps
  salvo en un teléfono rooteado. Atarlos al hardware es lo correcto, y no está
  hecho para no complicar el arranque.
- **Notificaciones push** cuando se confirma una reserva. Además de útil, es lo
  que distingue una app de una web ante la política de «funcionalidad mínima».
- **Fotos en carrusel** en el detalle: hoy se enseña sólo la principal.
- **Filtros** de precio, distrito y fechas. El buscador de la API ya los acepta
  todos; falta la interfaz.
- **Login con Google**, que en la web ya funciona. En Android va por otro camino
  (Credential Manager) y no es un rato.
