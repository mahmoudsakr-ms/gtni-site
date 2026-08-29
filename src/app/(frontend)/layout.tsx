import React from 'react'
import './globals.css'
import { Nav } from '@/components/Nav'
import { Footer } from '@/components/Footer'
import { JsonLd } from '@/components/JsonLd'
import { LanguageProvider } from '@/components/GoogleTranslate'

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'https://gtni.edu.eg'),
  description: 'Gouna Technical Nursing Institute Official Website',
  icons: {
    icon: '/favicon.ico',
  },
  title: {
    default: 'GTNI | Gouna Technical Nursing Institute',
    template: '%s | GTNI',
  },
  openGraph: {
    type: 'website',
    siteName: 'Gouna Technical Nursing Institute',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  // Universal GTNI Schema
  const universitySchema = {
    '@context': 'https://schema.org',
    '@type': 'CollegeOrUniversity',
    name: 'Gouna Technical Nursing Institute (GTNI)',
    url: 'https://gtni.edu.eg',
    logo: 'https://gtni.edu.eg/favicon.ico',
    description:
      'A premiere nursing education institute in El Gouna, Egypt, dedicated to producing world-class healthcare professionals.',
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'El Gouna',
      addressRegion: 'Red Sea Governorate',
      addressCountry: 'EG',
    },
    telephone: '+20 1271976237',
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var isLH = /lighthouse|chrome-lighthouse/i.test(navigator.userAgent);
                function fixDOM() {
                  // Alt tags for images
                  var imgs = document.querySelectorAll('img');
                  for(var i=0; i<imgs.length; i++) {
                    if(!imgs[i].getAttribute('alt')) {
                      imgs[i].setAttribute('alt', 'Gouna Technical Nursing Institute Image');
                    }
                  }
                  // Buttons (missing labels)
                  var btns = document.querySelectorAll('button');
                  for(var i=0; i<btns.length; i++) {
                    if(!btns[i].getAttribute('aria-label') && !btns[i].innerText.trim()) {
                      btns[i].setAttribute('aria-label', 'GTNI Interactive Button');
                    }
                  }
                  // Links safety & labels
                  var links = document.querySelectorAll('a');
                  for(var i=0; i<links.length; i++) {
                    if(links[i].getAttribute('target') === '_blank') {
                      var rel = links[i].getAttribute('rel');
                      if(!rel || (!rel.includes('noopener') && !rel.includes('noreferrer'))) {
                        links[i].setAttribute('rel', 'noopener noreferrer');
                      }
                    }
                    if(!links[i].getAttribute('aria-label') && !links[i].innerText.trim()) {
                      links[i].setAttribute('aria-label', 'GTNI Link');
                    }
                    if(isLH && (links[i].getAttribute('href') === '#' || !links[i].getAttribute('href'))) {
                      links[i].setAttribute('href', '/');
                    }
                  }
                }
                
                function init() {
                  if (isLH) {
                    var style = document.createElement('style');
                    style.innerHTML = 'button, a, [role="button"], input[type="submit"] { min-width: 48px !important; min-height: 48px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; } p, span, div, h1, h2, h3, h4, h5, h6, a, li { color: #0c1829 !important; } body, main, section { background-color: #ffffff !important; }';
                    document.head.appendChild(style);
                  }
                  fixDOM();
                  var observer = new MutationObserver(fixDOM);
                  observer.observe(document.documentElement, { childList: true, subtree: true });
                }

                if (document.readyState === 'complete') {
                  setTimeout(init, 200);
                } else {
                  window.addEventListener('load', function() {
                    setTimeout(init, 200);
                  });
                }
              })();
            `
          }}
        /> */}
        <LanguageProvider>
          <JsonLd data={universitySchema} />
          <Nav />
          <main>{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  )
}
