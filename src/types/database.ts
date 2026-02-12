// ============ SEO Metadata ============
export type PageStatus =
  | "draft"
  | "pending"
  | "published"
  | "archived"
  | "error";

export type SchemaType =
  | "Article"
  | "BlogPosting"
  | "Product"
  | "Service"
  | "FAQPage"
  | "WebPage";

export interface SEOMetadata {
  id: string;
  page_key: string;
  slug: string;
  title: string;
  meta_description: string | null;
  description: string | null; // legacy column
  h1: string | null;
  h2: string | null;
  keywords: string[];
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  canonical_url: string | null;
  language: string;
  status: PageStatus;
  content: string | null;
  sections_content: SectionContent[] | null;
  template_id: string | null;
  parent_page_key: string | null;
  is_public: boolean;
  exclude_from_sitemap: boolean;
  schema_type: SchemaType;
  schema_options: Record<string, any> | null;
  scheduled_at: string | null;
  published_at: string | null;
  imported_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============ Templates ============
export type SectionType =
  | "hero"
  | "rich_text"
  | "image_text"
  | "cta"
  | "faq"
  | "testimonials"
  | "gallery"
  | "features"
  | "stats"
  | "contact";

export interface TemplateSection {
  id: string;
  type: SectionType;
  label: string;
  required: boolean;
  min_words: number;
  max_words: number;
  order: number;
}

export interface PageTemplate {
  id: string;
  name: string;
  description: string | null;
  sections: TemplateSection[];
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============ Section Content ============
export interface SectionContent {
  section_id: string;
  type?: SectionType;
  content: string;
  background_image?: string;
  media?: string[];
}

// ============ Internal Links ============
export interface InternalLinkRule {
  id: string;
  keyword: string;
  target_page_key: string;
  max_occurrences: number;
  is_active: boolean;
  created_at: string;
}

// ============ Publication ============
export interface PublicationConfig {
  id: string;
  pages_per_day: number;
  is_active: boolean;
  last_run_at: string | null;
  updated_at: string;
}

// ============ Media ============
export interface MediaFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number | null;
  alt_text: string | null;
  uploaded_by: string | null;
  created_at: string;
}

// ============ User ============
export type UserRole = "admin" | "seo" | "editor" | "viewer";

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  created_at: string;
}

// ============ Reusable Components ============
export interface ComponentBlock {
  id: string;
  name: string;
  description: string | null;
  category: string;
  html_content: string;
  thumbnail: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

// ============ Section Catalog ============
export const SECTION_CATALOG: Record<
  SectionType,
  { label: string; description: string; icon: string }
> = {
  hero: {
    label: "Hero / En-tête",
    description: "Section principale avec titre et accroche",
    icon: "Layout",
  },
  rich_text: {
    label: "Texte riche",
    description: "Bloc de texte avec mise en forme",
    icon: "FileText",
  },
  image_text: {
    label: "Image + Texte",
    description: "Image accompagnée de texte",
    icon: "Image",
  },
  cta: {
    label: "Appel à l'action",
    description: "Bouton d'action avec texte",
    icon: "MousePointer",
  },
  faq: {
    label: "FAQ",
    description: "Questions / réponses",
    icon: "HelpCircle",
  },
  testimonials: {
    label: "Témoignages",
    description: "Avis et témoignages clients",
    icon: "MessageSquare",
  },
  gallery: {
    label: "Galerie",
    description: "Grille d'images ou de médias",
    icon: "Grid",
  },
  features: {
    label: "Fonctionnalités",
    description: "Liste de caractéristiques",
    icon: "List",
  },
  stats: {
    label: "Statistiques",
    description: "Chiffres clés et KPI",
    icon: "BarChart3",
  },
  contact: {
    label: "Contact",
    description: "Formulaire ou informations de contact",
    icon: "Mail",
  },
};
