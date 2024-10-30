'use client'

import Image from 'next/image'
import { useState } from 'react'

export default function ArticleImage({ 
  src, 
  alt,
  width = 200,
  height = 100,
  className = ""
}: { 
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
}) {
  const [error, setError] = useState(false)
  
  // Use the API route for placeholder
  const placeholderUrl = `/api/placeholder?width=${width}&height=${height}`

  // If the source is a base64 SVG, use placeholder immediately
  const initialSrc = src.startsWith('data:image/svg+xml;base64,') ? placeholderUrl : src

  return (
    <Image
      src={error ? placeholderUrl : initialSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={() => setError(true)}
      priority={true}
    />
  )
}