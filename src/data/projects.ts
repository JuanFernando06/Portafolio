export const PROJECTS = [
  {
    id: 'zukkonutri',
    title: 'ZukkoNutri',
    kind: 'appweb',
    badges: [
      { t: 'PWA · En producción', c: 'badge-live' },
      { t: 'App/Web', c: 'badge-web' }
    ],
    desc: 'PWA inspirada en Yuka para escanear, analizar y puntuar alimentos y cosméticos. Motor de puntuación propio, lectura de etiquetas con IA y sistema comunitario. Desplegada en producción con Netlify CI/CD.',
    bullets: [
      '<strong>Escáner inteligente:</strong> código de barras en vivo + OCR con Groq (Llama 3 Vision), hasta 5 fotos con recorte y compresión en cliente.',
      '<strong>Motor propio:</strong> nota 0–100 con tres métricas (aditivos, nutrición y global ponderada 35/65) y la lógica de "topes".',
      '<strong>Base de datos autosuficiente:</strong> +425 aditivos y +150 ingredientes INCI; los nuevos quedan pendientes de validación.',
      '<strong>Panel de administración:</strong> CMS, audit logs, moderación de reportes y editor de etiquetas con IA.',
      '<strong>Crowdsourcing:</strong> cualquier usuario puede añadir productos; nacen "sin verificar" y pasan por moderación.',
      '<strong>Backend Supabase:</strong> RLS avanzado, Auth con SMTP propio (Brevo), triggers y normalización de datos complejos.'
    ],
    stack: ['Next.js 15', 'React 19', 'TypeScript', 'Tailwind 4', 'Supabase', 'PostgreSQL', 'Groq AI', 'Framer Motion', 'Netlify'],
    images: Array.from({ length: 9 }, (_, i) => `/assets/nutrizukko/nutrizukko-${i + 1}.webp`),
    height: 'clamp(240px, 42vh, 420px)',
    link: 'https://zukkonutri.netlify.app',
    linkText: '🌐 Visitar ZukkoNutri en vivo'
  },
  {
    id: 'pzukko-player',
    title: 'PZukko Player',
    kind: 'app',
    badges: [
      { t: 'Android · Local-first', c: 'badge-app' },
      { t: 'App', c: 'badge-app' }
    ],
    desc: 'Reproductor de música local para Android, diseñado para ofrecer una experiencia limpia, rápida y sin distracciones, centrada en la biblioteca musical y las playlists del usuario. Local-first: sin cuenta, sin anuncios, sin datos.',
    bullets: [
      'Biblioteca local mediante MediaStore, reproducción en segundo plano y controles desde la pantalla de bloqueo.',
      'Playlists, buscador en tiempo real, ordenación avanzada y contador de reproducciones.',
      'Carga diferida y caché de portadas con concurrencia limitada para evitar bloqueos con 500+ canciones.',
      'Notificaciones compatibles con Android 13+, HyperOS y Foreground Services de Android 14/16.',
      'Estado optimista con Riverpod y estrategia de caché para resolver limitaciones de librerías nativas.'
    ],
    stack: ['Flutter', 'Dart', 'Riverpod', 'just_audio', 'Kotlin', 'Android'],
    images: Array.from({ length: 5 }, (_, i) => `/assets/pzukko-player/pzukko-player-${i + 1}.webp`),
    height: 'clamp(360px, 62vh, 560px)',
    link: null,
    linkText: null
  },
  {
    id: 'pzukkotip',
    title: 'PZukkoTip',
    kind: 'app',
    badges: [
      { t: 'Android', c: 'badge-app' },
      { t: 'App', c: 'badge-app' }
    ],
    desc: 'Tu biblioteca personal e inteligente para el contenido de redes sociales. PZukkoTip centraliza vídeos de TikTok, Instagram y YouTube, permitiendo guardarlos, buscarlos y organizarlos mediante categorías y subcategorías personalizables.',
    bullets: [
      'Captura de enlaces desde el menú Compartir del sistema y extracción automática de títulos y portadas.',
      'Categorización asistida por IA con visión artificial on-device y taxonomía jerárquica sin límites predefinidos.',
      'Biblioteca visual con cuadrícula, búsqueda, filtros, paginación y selección múltiple para borrado masivo.',
      'URLs normalizadas y reproducción delegada en la app nativa para mantener una experiencia fiable.',
      'Base de datos PostgreSQL con categorías autorreferenciadas, índices y políticas RLS para proteger los datos.'
    ],
    stack: ['Flutter', 'Dart', 'Supabase', 'PostgreSQL', 'Google ML Kit', 'Material 3'],
    images: Array.from({ length: 7 }, (_, i) => `/assets/pzukkotip/pzukko-tip-${i + 1}.webp`),
    height: 'clamp(360px, 62vh, 560px)',
    link: null,
    linkText: null
  },
  {
    id: 'punto-hogar-luci',
    title: 'Punto Hogar Luci',
    kind: 'web',
    badges: [
      { t: 'Web corporativa', c: 'badge-web' },
      { t: 'Web', c: 'badge-web' }
    ],
    desc: 'Página web informativa para una pequeña colchonería y tienda de ropa de hogar gestionada por un único autónomo, Sebastián Cava Gil, en Alcantarilla, Murcia. El objetivo fue crear una presencia digital cercana, profesional y fácil de consultar desde cualquier dispositivo.',
    bullets: [
      'Landing page responsive con presentación, especialidades, historia y contacto.',
      'Fotografías reales de la tienda y sus instalaciones.',
      'Botones de llamada telefónica y WhatsApp, dirección y horario.',
      'Enlaces a Google Maps, reseñas, Instagram y Facebook.',
      'Sección visual dedicada a colchones, textiles y ropa de hogar.',
      'Navegación responsive y textos alternativos para mejorar la accesibilidad.'
    ],
    stack: ['HTML5', 'CSS3', 'JavaScript', 'Responsive Design'],
    images: Array.from({ length: 8 }, (_, i) => `/assets/punto-hogar-luci/punto-hogar-luci-${i + 1}.webp`),
    height: 'clamp(240px, 42vh, 420px)',
    link: 'https://colchoneriapuntohogarluci.vercel.app/',
    linkText: '🌐 Ver Punto Hogar Luci'
  }
];
