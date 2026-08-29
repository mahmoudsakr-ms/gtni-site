import { type groupNavItems } from '@payloadcms/ui/shared'
import { DashboardBanner } from './DashboardBanner'
import './index.scss'
import { AdminViewProps, ServerProps } from 'payload'

import { Fragment, FC } from 'react'
type DashboardProps = {
  navGroups: ReturnType<typeof groupNavItems>
} & AdminViewProps &
  ServerProps

export const Dashboard: FC<DashboardProps> = (props) => {
  const {
    payload: {
      config: {
        routes: { admin: adminRoute },
      },
    },
  } = props

  return (
    <Fragment>
      <DashboardBanner />
      <div className="dashboard">
        <div className="dashboard__wrap">
          <div className="dashboard__header">
            <h1>GTNI Admin Dashboard</h1>
            <p>Manage your technical nursing institute content with ease and precision.</p>
          </div>

          <div className="dashboard__section">
            <div className="dashboard__section-header">
              <h2>System</h2>
            </div>
            <div className="dashboard__grid">
              <a href={`${adminRoute}/collections/users`} className="dashboard__card">
                <div className="dashboard__card-content">
                  <h3>Users</h3>
                  <p>Manage administrative accounts.</p>
                </div>
              </a>

              <a href={`${adminRoute}/collections/media`} className="dashboard__card">
                <div className="dashboard__card-content">
                  <h3>Media Library</h3>
                  <p>Central vault for all site images, videos, and documents.</p>
                </div>
              </a>
            </div>
          </div>

          <div className="dashboard__section">
            <div className="dashboard__section-header">
              <h2>Site Wide</h2>
            </div>
            <div className="dashboard__grid">
              <a href={`${adminRoute}/globals/header`} className="dashboard__card">
                <div className="dashboard__card-content">
                  <h3>Header</h3>
                  <p>Manage site logo, navigation links, and login dropdown.</p>
                </div>
              </a>

              <a href={`${adminRoute}/globals/footer`} className="dashboard__card">
                <div className="dashboard__card-content">
                  <h3>Footer</h3>
                  <p>Manage footer logo, social links, and contact information.</p>
                </div>
              </a>
            </div>
          </div>

          <div className="dashboard__section">
            <div className="dashboard__section-header">
              <h2>Pages</h2>
            </div>
            <div className="dashboard__grid">
              <a href={`${adminRoute}/globals/home`} className="dashboard__card">
                <div className="dashboard__card-content">
                  <h3>Homepage</h3>
                  <p>Refine and update the central hub of your website.</p>
                </div>
              </a>

              <a href={`${adminRoute}/globals/news-events-global`} className="dashboard__card">
                <div className="dashboard__card-content">
                  <h3>News & Events</h3>
                  <p>Broadcast the latest announcements and upcoming activities.</p>
                </div>
              </a>

              <a href={`${adminRoute}/globals/courses`} className="dashboard__card">
                <div className="dashboard__card-content">
                  <h3>Courses</h3>
                  <p>Organize academic course listings and descriptions.</p>
                </div>
              </a>

              <a href={`${adminRoute}/globals/student-services`} className="dashboard__card">
                <div className="dashboard__card-content">
                  <h3>Student Services</h3>
                  <p>Highlight student activities and campus experience.</p>
                </div>
              </a>

              <a href={`${adminRoute}/globals/about-gtni`} className="dashboard__card">
                <div className="dashboard__card-content">
                  <h3>About GTNI</h3>
                  <p>Tell your story and manage institute history and identity.</p>
                </div>
              </a>

              <a href={`${adminRoute}/globals/nursing-programs`} className="dashboard__card">
                <div className="dashboard__card-content">
                  <h3>The Program</h3>
                  <p>Define curriculum and nursing education tracks.</p>
                </div>
              </a>

              <a href={`${adminRoute}/globals/scholarships`} className="dashboard__card">
                <div className="dashboard__card-content">
                  <h3>Scholarships</h3>
                  <p>Manage financial aid opportunities and student grants.</p>
                </div>
              </a>

              <a href={`${adminRoute}/globals/admission`} className="dashboard__card">
                <div className="dashboard__card-content">
                  <h3>Admission</h3>
                  <p>Coordinate entry requirements and application processes.</p>
                </div>
              </a>

              <a href={`${adminRoute}/globals/vacancies`} className="dashboard__card">
                <div className="dashboard__card-content">
                  <h3>Vacancies</h3>
                  <p>Post and manage job openings and career opportunities.</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  )
}
