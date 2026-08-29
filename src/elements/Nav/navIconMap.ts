import { CollectionSlug, GlobalSlug } from 'payload'
import {
  BookOpen,
  Briefcase,
  Building2,
  FileText,
  GraduationCap,
  Home,
  Image,
  LayoutGrid,
  LucideProps,
  Menu,
  Newspaper,
  Stethoscope,
  Users,
  Gift,
  ClipboardList,
} from 'lucide-react'
import { ExoticComponent } from 'react'

/**
 * Icon map for GTNI Admin Navigation
 * Maps collection/global slugs to Lucide React icons
 */
export const navIconMap: Partial<
  Record<CollectionSlug | GlobalSlug, ExoticComponent<LucideProps>>
> = {
  // System / Collections
  users: Users,
  media: Image,
  'news-category': LayoutGrid,

  // Site Wide
  header: Menu,
  footer: LayoutGrid,

  // Pages - Globals
  home: Home,
  'news-events-global': Newspaper,
  courses: BookOpen,
  'student-services': GraduationCap,
  'about-gtni': Building2,
  'nursing-programs': Stethoscope,
  scholarships: Gift,
  admission: ClipboardList,
  vacancies: Briefcase,
}

export const getNavIcon = (slug: string) =>
  Object.hasOwn(navIconMap, slug) ? navIconMap[slug as CollectionSlug | GlobalSlug] : FileText
