import restaurantInfo from '../data/restaurantInfo';
import './AboutUs.css';

function AboutUs() {
  return (
    <div className="about-page">
      <section className="section">
        <div className="container section__header">
          <p className="section__eyebrow">About Us</p>
          <h1>Our Story</h1>
          <p>{restaurantInfo.about}</p>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <h2 className="about-page__subhead">Meet the Founders</h2>
          <div className="grid grid--2">
            {restaurantInfo.founders.map((founder) => (
              <div key={founder.name} className="card founder-card">
                <h3>{founder.name}</h3>
                <p className="founder-card__role">{founder.role}</p>
                <p>{founder.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container section__header">
          <p className="section__eyebrow">Our Commitment</p>
          <h2>Quality, Creativity, and Locally Sourced Ingredients</h2>
          <p>{restaurantInfo.commitment}</p>
        </div>
      </section>
    </div>
  );
}

export default AboutUs;
