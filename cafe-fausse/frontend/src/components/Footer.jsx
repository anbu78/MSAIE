import restaurantInfo from '../data/restaurantInfo';
import NewsletterSignup from './NewsletterSignup';
import './Footer.css';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__col">
          <h3 className="footer__title">{restaurantInfo.name}</h3>
          <p>{restaurantInfo.address}</p>
          <p>{restaurantInfo.phone}</p>
          <ul className="footer__hours">
            {restaurantInfo.hours.map((h) => (
              <li key={h.days}>
                <strong>{h.days}:</strong> {h.time}
              </li>
            ))}
          </ul>
        </div>
        <div className="footer__col">
          <h3 className="footer__title">Join Our Newsletter</h3>
          <p>Get news on seasonal menus, events, and special offers.</p>
          <NewsletterSignup compact />
        </div>
      </div>
      <p className="footer__copyright">
        © {new Date().getFullYear()} {restaurantInfo.name}. All rights reserved.
      </p>
    </footer>
  );
}

export default Footer;
