import { useEffect, useCallback } from 'react';
import './Lightbox.css';

function Lightbox({ images, activeIndex, onClose, onNavigate }) {
  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onNavigate((activeIndex + 1) % images.length);
      if (event.key === 'ArrowLeft') onNavigate((activeIndex - 1 + images.length) % images.length);
    },
    [activeIndex, images.length, onClose, onNavigate]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (activeIndex === null) return null;

  const image = images[activeIndex];

  return (
    <div className="lightbox" role="dialog" aria-modal="true" onClick={onClose}>
      <button className="lightbox__close" onClick={onClose} aria-label="Close">
        ×
      </button>
      <button
        className="lightbox__nav lightbox__nav--prev"
        aria-label="Previous image"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((activeIndex - 1 + images.length) % images.length);
        }}
      >
        ‹
      </button>
      <figure className="lightbox__content" onClick={(e) => e.stopPropagation()}>
        <img src={image.src} alt={image.alt} />
        <figcaption>{image.alt}</figcaption>
      </figure>
      <button
        className="lightbox__nav lightbox__nav--next"
        aria-label="Next image"
        onClick={(e) => {
          e.stopPropagation();
          onNavigate((activeIndex + 1) % images.length);
        }}
      >
        ›
      </button>
    </div>
  );
}

export default Lightbox;
