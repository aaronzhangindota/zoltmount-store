import { useEffect } from 'react'

const DEFAULT_TITLE = 'ZoltMount — Premium TV Mounts & Wall Brackets'
const SITE = 'https://zoltmount.com'

interface SEOOptions {
  title: string
  description?: string
  canonical?: string
}

export function useSEO({ title, description, canonical }: SEOOptions) {
  useEffect(() => {
    document.title = title

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]') as HTMLMetaElement | null
    if (description) {
      if (!metaDesc) {
        metaDesc = document.createElement('meta')
        metaDesc.name = 'description'
        document.head.appendChild(metaDesc)
      }
      metaDesc.content = description
    }

    // Canonical link
    let link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null
    if (canonical) {
      if (!link) {
        link = document.createElement('link')
        link.rel = 'canonical'
        document.head.appendChild(link)
      }
      link.href = canonical.startsWith('http') ? canonical : `${SITE}${canonical}`
    }

    return () => {
      document.title = DEFAULT_TITLE
      if (link) link.remove()
      if (metaDesc) metaDesc.remove()
    }
  }, [title, description, canonical])
}
