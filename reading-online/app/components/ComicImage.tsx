// app/components/ComicImage.tsx
'use client';
import { useState } from 'react';

interface ComicImageProps {
  src: string;
  alt: string;
  className?: string;
}

export default function ComicImage({ src, alt, className }: ComicImageProps) {
  const [imageSrc, setImageSrc] = useState(src);

  const handleError = () => {
    console.error('Image failed to load:', src);
    setImageSrc('/fallback.jpg');
  };

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      onError={handleError}
    />
  );
}