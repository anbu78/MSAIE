import { Link } from 'react-router-dom';
import restaurantInfo from '../data/restaurantInfo';
import './Home.css';

const HERO_IMAGE = '/images/hero-home.webp';

function Home() {
  return (
    <div className="home">
      <section
        className="hero"
        style={{ backgroundImage: `linear-gradient(rgba(20,15,10,0.55), rgba(20,15,10,0.55)), url(${HERO_IMAGE})` }}
      >
        <div className="container hero__content">
          <p className="section__eyebrow hero__eyebrow">Fine Dining in the Heart of the City</p>
          <h1 className="hero__title">{restaurantInfo.name}</h1>
          <p className="hero__subtitle">
            Traditional Italian flavors, reimagined with modern culinary artistry.
          </p>
          <div className="hero__actions">
            <Link to="/reservations" className="btn">
              Reserve a Table
            </Link>
            <Link to="/menu" className="btn btn--secondary">
              View Menu
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container grid grid--3 info-grid">
          <div className="card info-card">
            <h3>Address</h3>
            <p>{restaurantInfo.address}</p>
          </div>
          <div className="card info-card">
            <h3>Phone</h3>
            <p>{restaurantInfo.phone}</p>
          </div>
          <div className="card info-card">
            <h3>Hours</h3>
            {restaurantInfo.hours.map((h) => (
              <p key={h.days}>
                <strong>{h.days}:</strong> {h.time}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container section__header">
          <p className="section__eyebrow">Our Story</p>
          <h2>A Taste of Italy, Crafted with Passion</h2>
          <p>{restaurantInfo.about}</p>
          <Link to="/about" className="btn btn--secondary">
            Learn More About Us
          </Link>
        </div>
      </section>
    </div>
  );
}

export default Home;
