'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import RichText from '@/components/RichText'
import { Calendar, CheckCircle2 } from 'lucide-react'
import { Media } from '@/payload-types'
import type { StudentService } from '@/payload-types'
import RunawayTriangles from './PhysicsTriangle'
import Link from 'next/link'
import { SmartText } from './SmartText'
interface StudentServicesWithUrl extends StudentService {
  handbookUrl?: string | null
}

interface StudentServicesClientProps {
  data: StudentServicesWithUrl
}

export const StudentServicesClient: React.FC<StudentServicesClientProps> = ({ data }) => {
  const heroImage = data.heroImage as Media | null | undefined
  const heroTitle = data.heroTitle || ''
  const heroSubtitle = data.heroSubtitle
  const _overviewCategory = data.overviewCategory
  const studentServicesListTitle = data.studentServicesListTitle
  const purpose = data.purpose
  const services = data.services || []
  const policyTitle = data.policyTitle
  const policyDescription = data.policyDescription
  const handbookMedia = data.Handbook as Media | null | undefined
  const handbookUrl = (data as StudentServicesWithUrl).handbookUrl
  const reviewedBy = data.reviewedBy
  const reviewDate = data.reviewDate
  const approvedBy = data.approvedBy
  const approvalDate = data.approvalDate

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] mt-20 flex items-center justify-center overflow-hidden">
        {/* Background Image with Parallax Effect */}
        {heroImage?.url ? (
          <div className="absolute inset-0">
            <Image
              src={heroImage.url}
              alt={heroTitle}
              fill
              sizes="100vw"
              quality={100}
              priority
              className="object-bottom object-cover scale-110"
              style={{ transform: 'translateZ(0)' }}
            />
            {/* Multi-layer Gradient Overlay */}
            <div className="absolute inset-0 bg-linear-to-t from-brand-dark/90 via-brand-dark/20 to-transparent" />
          </div>
        ) : (
          /* Premium Animated Background when no image */
          <div className="absolute inset-0 bg-brand-dark">
            {/* Animated Gradient Orbs */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-turquoise/20 rounded-full blur-3xl animate-pulse" />
            <div
              className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-brand-primary/20 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '1s' }}
            />
            <div
              className="absolute top-1/2 right-1/3 w-64 h-64 bg-linear-to-br from-brand-turquoise/30 to-brand-primary/30 rounded-full blur-3xl animate-pulse"
              style={{ animationDelay: '2s' }}
            />

            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-5"
              style={{
                backgroundImage: `linear-gradient(rgba(0, 240, 255, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 240, 255, 0.3) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
              }}
            />
          </div>
        )}

        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/2 h-full overflow-hidden pointer-events-none">
          <svg
            className="absolute -right-20 -top-20 w-96 h-96 text-brand-turquoise/10"
            viewBox="0 0 200 200"
          >
            <circle cx="100" cy="100" r="80" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="60" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <circle cx="100" cy="100" r="40" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Floating Shapes - Interactive Runaway Triangles */}
        <RunawayTriangles />
        <div
          className="absolute top-40 right-20 w-16 h-16 border border-brand-turquoise/20 rounded-full animate-bounce"
          style={{ animationDuration: '4s' }}
        />

        {/* Hero Content */}
        <div className="container mx-auto max-w-7xl px-4 relative z-10 py-32">
          <div className="mx-auto max-w-4xl items-center flex flex-col text-center">
            {/* Breadcrumb / Category Tag */}
            <div className="inline-flex items-center gap-2 mb-6">
              {/* <span className="w-12 h-px bg-brand-turquoise" /> */}
              {/* <span className="text-brand-turquoise text-sm font-semibold tracking-[0.3em] uppercase">
                     {pageType?.replace('-', ' ') || 'GTNI'}
                   </span> */}
            </div>

            {/* Title with Gradient Effect */}
            {heroTitle && (
              <h1 className="text-3xl lg:text-4xl font-black text-white mb-6">
                <span className="inline-block">{heroTitle}</span>
              </h1>
            )}

            {/* Subtitle */}
            {heroSubtitle && (
              <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl leading-relaxed font-light">
                {heroSubtitle}
              </p>
            )}

            {/* Decorative Line */}
            {heroTitle && (
              <div className="flex items-center gap-4">
                <div className="w-24 h-1.5 bg-linear-to-r from-brand-turquoise to-brand-primary rounded-full" />
                <div className="w-3 h-3 bg-brand-turquoise rounded-full animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Purpose Section */}
      {purpose && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4 max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-start"
            >
              <h2 className="lg:text-2xl md:text-xl font-bold text-brand-dark mb-6">
                <SmartText text="Student Services" />
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600">
                <RichText content={purpose} />
              </div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Services Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-start mb-16"
          >
            <h2 className="lg:text-2xl md:text-xl font-bold text-brand-dark">
              {studentServicesListTitle || ''}
            </h2>
          </motion.div>

          <div className="space-y-12">
            {services.map((service, index) => {
              // Get table headers
              const headers = [
                service.tableData?.columnHeader1,
                service.tableData?.columnHeader2,
                service.tableData?.columnHeader3,
              ].filter(Boolean)

              const displayImages =
                service.serviceImages
                  ?.map((imgObj) => imgObj.image as Media | null)
                  .filter((media) => media?.url) || []

              // Get table rows
              const tableRows = service.tableData?.tableRows || []

              const hasImages = displayImages.length > 0

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-3xl shadow-xl py-8 px-4 border border-gray-100 hover:shadow-2xl transition-shadow overflow-hidden group/card"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Content Side */}
                    <div className={hasImages ? 'lg:col-span-8' : 'lg:col-span-12'}>
                      <h3 className="lg:text-2xl md:text-xl font-bold text-brand-dark mb-4 transition-colors group-hover/card:text-brand-turquoise">
                        {service.serviceName}
                      </h3>
                      {service.serviceDescription && (
                        <div className="prose prose-lg text-gray-600 mb-6 max-w-none">
                          <RichText content={service.serviceDescription} />
                        </div>
                      )}

                      {/* Additional Note */}
                      {service.additionalNote && (
                        <div className="mt-4 p-4 bg-brand-turquoise/5 border-l-4 border-brand-turquoise rounded-r-lg">
                          <p className="text-gray-700 italic">{service.additionalNote}</p>
                        </div>
                      )}

                      {/* Table */}
                      {service.hasTable && headers.length > 0 && (
                        <div className="mt-6 overflow-x-auto">
                          {service.tableData?.tableTitle && (
                            <h4 className="text-lg font-bold text-brand-dark mb-3">
                              {service.tableData.tableTitle}
                            </h4>
                          )}
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-brand-dark text-white">
                                {headers.map((header, idx) => (
                                  <th
                                    key={idx}
                                    className="px-4 py-3 text-start text-sm font-bold border border-gray-700"
                                  >
                                    {header}
                                  </th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {tableRows.map((row, rowIdx) => (
                                <tr
                                  key={rowIdx}
                                  className={rowIdx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                                >
                                  {service.tableData?.columnHeader1 && (
                                    <td className="px-4 py-3 text-sm border border-gray-200">
                                      {row.col1}
                                    </td>
                                  )}
                                  {service.tableData?.columnHeader2 && (
                                    <td className="px-4 py-3 text-sm border border-gray-200">
                                      {row.col2}
                                    </td>
                                  )}
                                  {service.tableData?.columnHeader3 && (
                                    <td className="px-4 py-3 text-sm border border-gray-200">
                                      {row.col3}
                                    </td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Image Grid Side */}
                    {hasImages && (
                      <div className="lg:col-span-4 mt-4 h-full">
                        <div className="grid grid-cols-2 justify-center items-center gap-4 h-full min-h-[300px]">
                          {displayImages.map((media: Media | null, imgIdx: number) => {
                            if (!media?.url) return null

                            return (
                              <motion.div
                                key={imgIdx}
                                whileHover={{ scale: 1.05, zIndex: 10 }}
                                className="relative aspect-square w-full h-full rounded-2xl overflow-hidden shadow-lg border border-gray-100"
                              >
                                <Image
                                  src={media.url}
                                  alt={media.alt || service.serviceName}
                                  fill
                                  sizes="(max-width: 768px) 50vw, 25vw"
                                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-brand-dark/0 group-hover:bg-brand-dark/10 transition-colors duration-500" />
                              </motion.div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Student Policy Section */}
      {(policyTitle || policyDescription || handbookMedia || handbookUrl) && (
        <section className="py-20 bg-brand-dark relative overflow-hidden">
          {/* Decorative background orbs */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-brand-turquoise/5 blur-[120px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-1/3 h-full bg-brand-primary/5 blur-[120px] rounded-full pointer-events-none" />

          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Text Side */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                {policyTitle && (
                  <h2 className="lg:text-3xl md:text-2xl font-black text-white mb-8 leading-tight">
                    {policyTitle}
                  </h2>
                )}
                {policyDescription && (
                  <div className="prose prose-lg prose-invert text-gray-300 mb-10 max-w-none">
                    <RichText content={policyDescription} />
                  </div>
                )}

                {handbookUrl && (
                  <Link
                    href={handbookUrl}
                    target="_blank"
                    className="inline-flex items-center gap-3 px-8 py-4 bg-brand-turquoise text-brand-dark font-bold text-lg rounded-2xl hover:bg-white hover:scale-105 transition-all duration-300 shadow-xl shadow-brand-turquoise/20"
                  >
                    Explore Student Handbook
                    <Calendar size={20} />
                  </Link>
                )}
              </motion.div>

              {/* Handbook Image Side */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative group"
              >
                {handbookUrl ? (
                  <Link
                    href={handbookUrl}
                    target="_blank"
                    className="block relative w-full max-w-sm mx-auto perspective-1000"
                  >
                    <div className="absolute inset-0 bg-brand-turquoise/20 blur-2xl rounded-3xl group-hover:bg-brand-turquoise/40 transition-all duration-500" />
                    {handbookMedia?.url ? (
                      <motion.div
                        whileHover={{ rotateY: -15, rotateX: 5 }}
                        className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10"
                      >
                        <Image
                          src={handbookMedia.url}
                          alt={handbookMedia.alt || 'Student Handbook'}
                          width={handbookMedia.width || 600}
                          height={handbookMedia.height || 800}
                          className="w-full h-auto"
                        />
                        {/* Glass effect overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-brand-dark/40 to-transparent" />
                      </motion.div>
                    ) : (
                      <div className="relative h-full w-full bg-brand-dark border border-white/10 rounded-2xl flex items-center justify-center p-8 text-center">
                        <p className="text-gray-400">Handbook Preview Image Not Found in CMS</p>
                      </div>
                    )}

                    {/* Custom User Hand SVG Animation */}
                    <div className="absolute inset-0 z-30 pointer-events-none flex items-start pt-12 justify-center">
                      <motion.div
                        animate={{
                          opacity: [0, 1, 1, 0],
                          scale: [1, 0.95, 1, 1], // Realistic subtle press
                          x: [20, 0, 0, 20],
                          y: [20, 0, 0, 20],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          times: [0, 0.3, 0.6, 1],
                          ease: 'easeOut',
                        }}
                        className="relative"
                        style={{ filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.3))' }}
                      >
                        {/* Touch Ripple - Perfectly aligned with index finger */}
                        <motion.div
                          animate={{
                            scale: [0, 1.5],
                            opacity: [0.5, 0],
                            strokeWidth: [0, 2],
                          }}
                          transition={{
                            duration: 0.6,
                            repeat: Infinity,
                            repeatDelay: 1.9,
                            times: [0, 1],
                          }}
                          className="absolute top-[-8px] left-[-8px] w-8 h-8 rounded-full border-2 border-brand-turquoise bg-brand-turquoise/20"
                        />

                        {/* Custom User Hand SVG */}
                        <svg
                          width="80"
                          height="80"
                          viewBox="0 0 500 500"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="text-white drop-shadow-md"
                        >
                          <g>
                            <path
                              fill="currentColor"
                              d="M343.5,286.4c0-7.3,0.9-15.2-2.7-21.9c-6.2-11.8-21.6-15.5-32.5-8.3c-0.1-1-0.2-2.1-0.4-3.1
                            c-1.3-7-6.4-13.5-12.8-16.5c-7.1-3.3-15.2-3.2-22.1,0.7c-0.6,0.4-1.2,0.8-1.8,1.2c-0.1-0.9-0.2-1.7-0.3-2.6
                            c-1.3-7-6.4-13.5-12.8-16.5c-7.1-3.3-15.2-3.2-22.1,0.7c-0.6,0.3-1.1,0.7-1.6,1.1c0-11.9,0-23.7,0-35.6c0-6.7,0.2-13.4,0-20.1
                            c-0.5-17.1-17.7-29.6-34.1-22.7c-18.2,7.8-15,28.4-15,44.5c0,23.2,0,46.4,0,69.6c0,11,0,22,0,33c-5.1-7.1-10.1-14.3-15.2-21.4
                            c-6.9-9.6-18.6-14.6-30.1-10c-13.2,5.3-19,21.1-12.8,33.8c1.9,3.8,4.6,7.2,7,10.7c4.8,7,9.6,14.1,14.4,21.1
                            c10,14.8,20.1,29.6,30.1,44.3c17.8,26.2,40.6,50.7,73.4,56.4c23.4,4,49.9-0.9,66.9-18.4c16.7-17.2,22.1-42.1,23.8-65.2
                            C344.3,323,343.5,304.6,343.5,286.4z M297,252.8C296.9,252.6,296.8,252.2,297,252.8L297,252.8z M260,235.6
                            C259.9,235.4,259.8,235,260,235.6L260,235.6z"
                            />
                            <g>
                              <path
                                fill="currentColor"
                                d="M166.8,201c-13.7-13.2-20.5-31.5-18.7-50.4c3.2-33.9,33.5-58.8,67.4-55.6c33.9,3.3,58.8,33.5,55.6,67.4
                              c-1.4,14.4-7.8,27.9-18.1,38.1l-2.9-3c9.6-9.5,15.6-22.1,16.9-35.5c3-31.6-20.2-59.8-51.8-62.8c-31.6-3-59.8,20.2-62.8,51.8
                              c-1.7,17.6,4.7,34.7,17.4,47L166.8,201z"
                              />
                              <path
                                fill="currentColor"
                                d="M161.5,223.6c-23.8-17.1-36.8-45.8-34-75c2.1-21.9,12.6-41.8,29.6-55.8c17-14,38.4-20.6,60.4-18.5
                              c21.9,2.1,41.8,12.6,55.8,29.6c14,17,20.6,38.5,18.5,60.4c-2,20.4-11.3,39.2-26.5,53l-5.6-6.2c13.6-12.4,22-29.3,23.8-47.7
                              c1.9-19.7-4-39-16.6-54.3c-12.6-15.3-30.4-24.8-50.2-26.6c-19.7-1.9-39,4-54.3,16.6c-15.3,12.6-24.8,30.4-26.6,50.2
                              c-2.5,26.2,9.2,52,30.6,67.4L161.5,223.6z"
                              />
                              <path
                                fill="currentColor"
                                d="M173.6,176c-3.9-7.2-5.6-15.3-4.8-23.5c1-10.9,6.3-20.7,14.7-27.7c8.4-7,19.1-10.3,30-9.2
                              c10.9,1,20.7,6.3,27.7,14.7c7,8.4,10.2,19.1,9.2,30c-0.5,5.1-1.9,9.9-4.1,14.4l-2.8-1.4c2.1-4.2,3.4-8.6,3.8-13.3
                              c1-10.1-2-19.9-8.5-27.7c-6.4-7.8-15.5-12.6-25.6-13.6c-10.1-1-19.9,2-27.7,8.5c-7.8,6.4-12.6,15.5-13.6,25.6
                              c-0.7,7.5,0.8,15,4.4,21.7L173.6,176z"
                              />
                            </g>
                          </g>
                        </svg>
                      </motion.div>
                    </div>
                  </Link>
                ) : (
                  <div className="block relative w-full max-w-sm mx-auto perspective-1000">
                    <div className="absolute inset-0 bg-brand-turquoise/20 blur-2xl rounded-3xl" />
                    {handbookMedia?.url && (
                      <div className="relative h-full w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                        <Image
                          src={handbookMedia.url}
                          alt={handbookMedia.alt || 'Student Handbook'}
                          width={handbookMedia.width || 600}
                          height={handbookMedia.height || 800}
                          className="w-full h-auto"
                        />
                        {/* Glass effect overlay */}
                        <div className="absolute inset-0 bg-linear-to-t from-brand-dark/40 to-transparent" />
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>
      )}

      {/* Approval Footer */}
      {(reviewedBy || approvedBy) && (
        <section className="py-12 bg-gray-50 border-t border-gray-100">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reviewedBy && (
                <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">
                  <Calendar className="text-brand-turquoise" size={24} />
                  <div>
                    <p className="text-sm text-gray-500">Reviewed By</p>
                    <p className="font-bold text-brand-dark">{reviewedBy}</p>
                    {reviewDate && (
                      <p className="text-sm text-gray-400">
                        {new Date(reviewDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}
              {approvedBy && (
                <div className="flex items-center gap-4 p-6 bg-white rounded-2xl shadow-sm">
                  <CheckCircle2 className="text-green-500" size={24} />
                  <div>
                    <p className="text-sm text-gray-500">Approved By</p>
                    <p className="font-bold text-brand-dark">{approvedBy}</p>
                    {approvalDate && (
                      <p className="text-sm text-gray-400">
                        {new Date(approvalDate).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
