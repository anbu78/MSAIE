import { useState } from 'react';
import gallery, { awards, reviews } from '../data/gallery';
import Lightbox from '../components/Lightbox';
import './Gallery.css';

function Gallery() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <div className="gallery-page">
      <section className="section">
        <div className="container section__header">
          <p className="section__eyebrow">Gallery</p>
          <h1>A Glimpse Inside Café Fausse</h1>
          <p>Browse our dining room, signature dishes, and special events.</p>
        </div>

        <div className="container">
          <div className="gallery-grid">
            {gallery.map((image, index) => (
              <button
                key={image.id}
                className="gallery-grid__item"
                onClick={() => setActiveIndex(index)}
                aria-label={`View larger image: ${image.alt}`}
              >
                <img src={image.src} alt={image.alt} loading="lazy" />
                <span className="gallery-grid__category">{image.category}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <h2 className="gallery-page__subhead">Awards</h2>
          <div className="grid grid--3">
            {awards.map((award) => (
              <div key={award.title} className="card award-card">
                <h3>{award.title}</h3>
                <p>
                  {award.source ? `${award.source} · ` : ''}
                  {award.year}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="gallery-page__subhead">What Our Guests Say</h2>
          <div className="grid grid--2">
            {reviews.map((review) => (
              <blockquote key={review.quote} className="card review-card">
                <p>“{review.quote}”</p>
                <footer>— {review.source}</footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <Lightbox
        images={gallery}
        activeIndex={activeIndex}
        onClose={() => setActiveIndex(null)}
        onNavigate={setActiveIndex}
      />
    </div>
  );
}

export default Gallery;
