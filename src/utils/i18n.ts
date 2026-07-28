export type Locale = 'es' | 'en' | 'fr';

export const locales: Locale[] = ['es', 'en', 'fr'];

export const defaultLocale: Locale = 'es';

export const translations = {
  es: {
    'nav.home': 'Inicio',
    'nav.about': 'Sobre mí',
    'nav.repo': 'Salud Integrativa',
    'nav.guide': 'Guía de Afrontamiento',
    'nav.contact': 'Contacto',
    'skipToContent': 'Saltar al contenido principal',
    'themeToggle': 'Cambiar tema de color',
    'footer.copyright': '© {year} Cesar Santos. Fisioterapia y Salud Integrativa.',
    'footer.legal': 'Aviso Legal y Política de Privacidad',
    'lang.label': 'Seleccionar idioma',
    'latestPosts': 'Últimos artículos y notas clínicas',
    'readMore': 'Leer artículo completo',
    'viewAll': 'Ver todas las publicaciones',
    'doiLabel': 'Estudio científico analizado (DOI)',
    'pubmedLabel': 'Ver publicación original en PubMed',
    'authorLabel': 'Divulgación y síntesis por',
    'publishedLabel': 'Publicado el',
    'categoryLabel': 'Especialidad',
    'contactTitle': 'Contacto',
    'contactSubtitle': 'Consultas, docencia y colaboraciones profesionales',
    'academicCv': 'Mi Historia y Formación',
    'manifestoTitle': 'Ciencia, Resiliencia y Salud Integrativa'
  },
  en: {
    'nav.home': 'Home',
    'nav.about': 'About me',
    'nav.repo': 'Integrative Health',
    'nav.guide': 'Coping Guide',
    'nav.contact': 'Contact',
    'skipToContent': 'Skip to main content',
    'themeToggle': 'Toggle color theme',
    'footer.copyright': '© {year} Cesar Santos. Physiotherapy & Integrative Health.',
    'footer.legal': 'Legal Notice & Privacy Policy',
    'lang.label': 'Select language',
    'latestPosts': 'Latest articles and clinical notes',
    'readMore': 'Read full article',
    'viewAll': 'View all publications',
    'doiLabel': 'Analyzed scientific study (DOI)',
    'pubmedLabel': 'View original study on PubMed',
    'authorLabel': 'Dissemination and synthesis by',
    'publishedLabel': 'Published on',
    'categoryLabel': 'Specialty',
    'contactTitle': 'Contact',
    'contactSubtitle': 'Consultations, teaching, and professional collaborations',
    'academicCv': 'My Story & Education',
    'manifestoTitle': 'Science, Resilience & Integrative Health'
  },
  fr: {
    'nav.home': 'Accueil',
    'nav.about': 'À propos',
    'nav.repo': 'Santé Intégrative',
    'nav.guide': 'Guide d\'adaptation',
    'nav.contact': 'Contact',
    'skipToContent': 'Passer au contenu principal',
    'themeToggle': 'Changer le thème de couleur',
    'footer.copyright': '© {year} Cesar Santos. Physiothérapie & Santé Intégrative.',
    'footer.legal': 'Mentions Légales & Politique de Confidentialité',
    'lang.label': 'Sélectionner la langue',
    'latestPosts': 'Derniers articles et notes cliniques',
    'readMore': 'Lire l\'article complet',
    'viewAll': 'Voir toutes les publications',
    'doiLabel': 'Étude scientifique analysée (DOI)',
    'pubmedLabel': 'Voir l\'étude originale sur PubMed',
    'authorLabel': 'Vulgarisation et synthèse par',
    'publishedLabel': 'Publié le',
    'categoryLabel': 'Spécialité',
    'contactTitle': 'Contact',
    'contactSubtitle': 'Consultations, enseignement et collaborations professionnelles',
    'academicCv': 'Mon Histoire & Formation',
    'manifestoTitle': 'Science, Résilience & Santé Intégrative'
  }
} as const;

export function useTranslations(locale: Locale) {
  return function t(key: keyof typeof translations['es'], interpolations?: Record<string, string | number>) {
    let text = translations[locale][key] || translations[defaultLocale][key] || '';
    if (interpolations) {
      Object.entries(interpolations).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    return text;
  };
}

export function getLocalizedPath(path: string, locale: Locale): string {
  const cleanPath = path.replace(/^\/(en|fr)/, '').replace(/^\/+/, '');
  if (locale === defaultLocale) {
    return `/${cleanPath}`;
  }
  return `/${locale}/${cleanPath}`;
}
