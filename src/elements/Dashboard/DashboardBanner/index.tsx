import Image from 'next/image'
import { BASE_PATH } from '@/utilities/publicUrl'

import './index.scss'

const baseClass = 'dashboard-banner'

export const DashboardBanner = () => {
  return (
    <div className={baseClass}>
      <div className={`${baseClass}__wrap`}>
        <div className={`${baseClass}__image-wrap`}>
          <Image src={`${BASE_PATH}/image-login1.webp`} alt="" fill sizes="100vw" />
        </div>
      </div>
    </div>
  )
}
