import Image from 'next/image'

import './index.scss'

const baseClass = 'before-login'

export const BeforeLogin = () => {
  return (
    <aside className={baseClass}>
      <div className={`${baseClass}__image-wrap`}>
        <Image src="/image-login1.webp" alt="" fill sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
    </aside>
  )
}
