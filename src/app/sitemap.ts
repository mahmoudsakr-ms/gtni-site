import { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'https://gtni.edu.eg'
  const currentDate = new Date()

  // Try to fetch real updatedAt times from Payload
  let homeLastMod = currentDate
  let aboutLastMod = currentDate
  let admissionLastMod = currentDate
  let coursesLastMod = currentDate
  let scholarshipsLastMod = currentDate
  let studentServicesLastMod = currentDate
  let newsEventsLastMod = currentDate
  let vacanciesLastMod = currentDate
  let nursingProgramsLastMod = currentDate

  try {
    const payload = await getPayload({ config: configPromise })

    // Fetch all globals safely
    const [
      homeRes,
      aboutRes,
      admissionRes,
      coursesRes,
      scholarshipsRes,
      studentServicesRes,
      newsEventsRes,
      vacanciesRes,
      nursingRes,
    ] = await Promise.all([
      payload.findGlobal({ slug: 'home', depth: 0 }).catch(() => null),
      payload.findGlobal({ slug: 'about-gtni', depth: 0 }).catch(() => null),
      payload.findGlobal({ slug: 'admission', depth: 0 }).catch(() => null),
      payload.findGlobal({ slug: 'courses', depth: 0 }).catch(() => null),
      payload.findGlobal({ slug: 'scholarships', depth: 0 }).catch(() => null),
      payload.findGlobal({ slug: 'student-services', depth: 0 }).catch(() => null),
      payload.findGlobal({ slug: 'news-events-global', depth: 0 }).catch(() => null),
      payload.findGlobal({ slug: 'vacancies', depth: 0 }).catch(() => null),
      payload.findGlobal({ slug: 'nursing-programs', depth: 0 }).catch(() => null),
    ])

    if (homeRes?.updatedAt) homeLastMod = new Date(homeRes.updatedAt)
    if (aboutRes?.updatedAt) aboutLastMod = new Date(aboutRes.updatedAt)
    if (admissionRes?.updatedAt) admissionLastMod = new Date(admissionRes.updatedAt)
    if (coursesRes?.updatedAt) coursesLastMod = new Date(coursesRes.updatedAt)
    if (scholarshipsRes?.updatedAt) scholarshipsLastMod = new Date(scholarshipsRes.updatedAt)
    if (studentServicesRes?.updatedAt) studentServicesLastMod = new Date(studentServicesRes.updatedAt)
    if (newsEventsRes?.updatedAt) newsEventsLastMod = new Date(newsEventsRes.updatedAt)
    if (vacanciesRes?.updatedAt) vacanciesLastMod = new Date(vacanciesRes.updatedAt)
    if (nursingRes?.updatedAt) nursingProgramsLastMod = new Date(nursingRes.updatedAt)
  } catch (err) {
    console.error('Sitemap generation failed to fetch updatedAt times:', err)
  }

  // Generate routes with their actual last modified time. Each entry maps to a
  // path relative to the locale root; English is unprefixed, Arabic gets /ar.
  const staticRoutes = [
    { path: '', lastModified: homeLastMod, priority: 1.0 },
    { path: '/about-gtni', lastModified: aboutLastMod, priority: 0.9 },
    { path: '/admission', lastModified: admissionLastMod, priority: 0.9 },
    { path: '/nursing-programs', lastModified: nursingProgramsLastMod, priority: 0.9 },
    { path: '/courses', lastModified: coursesLastMod, priority: 0.8 },
    { path: '/scholarships', lastModified: scholarshipsLastMod, priority: 0.8 },
    { path: '/student-services', lastModified: studentServicesLastMod, priority: 0.8 },
    { path: '/news-events', lastModified: newsEventsLastMod, priority: 0.8 },
    { path: '/vacancies', lastModified: vacanciesLastMod, priority: 0.8 },
  ]

  const routes = staticRoutes.flatMap((route) => [
    {
      url: `${baseUrl}${route.path}`,
      lastModified: route.lastModified,
      changeFrequency: 'monthly' as const,
      priority: route.priority,
    },
    {
      url: `${baseUrl}/ar${route.path}`,
      lastModified: route.lastModified,
      changeFrequency: 'monthly' as const,
      priority: route.priority,
    },
  ])

  return routes
}
