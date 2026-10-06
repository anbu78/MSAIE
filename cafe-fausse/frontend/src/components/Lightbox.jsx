import { useEffect, useCallback, useRef } from 'react';
import './Lightbox.css';

function Lightbox({ images, activeIndex, onClose, onNavigate }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previouslyFocusedRef = useRef(null);
  const isOpen = activeIndex !== null;

  const handleKeyDown = useCallback(
    (event) => {
      // Only react to these keys while the dialog is actually open — a
      // closed lightbox must not "open" itself in response to an arrow
      // key press elsewhere on the page.
      if (!isOpen) return;

      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        onNavigate((activeIndex + 1) % images.length);
        return;
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        onNavigate((activeIndex - 1 + images.length) % images.length);
        return;
      }

      // Basic focus trap: keep Tab / Shift+Tab cycling among the focusable
      // elements inside the dialog instead of escaping to the gallery grid
      // behind it.
      if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll('button');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    },
    [isOpen, activeIndex, images.length, onClose, onNavigate]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Move focus into the dialog when it opens, and restore focus to whatever
  // triggered it (the gallery thumbnail button) when it closes.
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedRef.current = document.activeElement;
      closeButtonRef.current?.focus();
    } else if (previouslyFocusedRef.current) {
      previouslyFocusedRef.current.focus();
      previouslyFocusedRef.current = null;
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const image = images[activeIndex];

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`Image viewer: ${image.alt}`}
      ref={dialogRef}
      onClick={onClose}
    >
      <button ref={closeButtonRef} className="lightbox__close" onClick={onClose} aria-label="Close">
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
