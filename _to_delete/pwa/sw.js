/*
  Service worker de PyFGroup.

  Deliberadamente conservador. Un service worker mal escrito es de los errores
  más caros que existen: se queda instalado en el teléfono de la gente y les
  sirve una versión vieja de la web durante días, sin que puedas hacer nada
  desde el servidor. Así que aquí sólo se guarda lo que es seguro guardar.

  El reparto:

  - Los archivos de /_next/static llevan un hash en el nombre. Si el contenido
    cambia, cambia la URL. Por eso se pueden servir desde caché sin miedo.
  - Todo lo demás va a la red primero. Si la red falla, se intenta la caché, y
    si tampoco está, se muestra la página de sin conexión.
  - Las peticiones a la API y todo lo que no sea GET no se tocan nunca. Cachear
    una reserva o un login sería un desastre.
*/

const VERSION = 'pyfgroup-v1';
const ESTATICOS = `${VERSION}-estaticos`;
const PAGINAS = `${VERSION}-paginas`;
const SIN_CONEXION = '/sin-conexion';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PAGINAS).then((cache) => cache.addAll([SIN_CONEXION])),
  );
  // Sin esto, el service worker nuevo espera a que se cierren todas las
  // pestañas antes de activarse. Con una web abierta en el móvil, eso puede
  // no pasar nunca.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(claves.filter((c) => !c.startsWith(VERSION)).map((c) => caches.delete(c))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Sólo GET. Un POST cacheado sería una reserva duplicada.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Sólo el propio dominio. Las imágenes de Cloudinary y las llamadas a la API
  // en Render las gestiona el navegador con sus propias cabeceras.
  if (url.origin !== self.location.origin) return;

  // Nada de la API, aunque viniera del mismo origen.
  if (url.pathname.startsWith('/api/')) return;

  // Estáticos con hash: de la caché, y si no está, de la red.
  if (url.pathname.startsWith('/_next/static/')) {
    event.respondWith(
      caches.match(request).then(
        (guardado) =>
          guardado ??
          fetch(request).then((respuesta) => {
            const copia = respuesta.clone();
            caches.open(ESTATICOS).then((cache) => cache.put(request, copia));
            return respuesta;
          }),
      ),
    );
    return;
  }

  // El resto: red primero. La caché es sólo el paracaídas.
  event.respondWith(
    fetch(request)
      .then((respuesta) => {
        // Sólo se guardan respuestas correctas del propio servidor. Guardar un
        // 404 o un 500 sería servirlo luego a alguien que sí tiene conexión.
        if (respuesta.ok && respuesta.type === 'basic') {
          const copia = respuesta.clone();
          caches.open(PAGINAS).then((cache) => cache.put(request, copia));
        }
        return respuesta;
      })
      .catch(async () => {
        const guardado = await caches.match(request);
        if (guardado) return guardado;

        // Si lo que falló era una navegación, al menos que vea algo nuestro.
        if (request.mode === 'navigate') {
          const offline = await caches.match(SIN_CONEXION);
          if (offline) return offline;
        }

        return Response.error();
      }),
  );
});
