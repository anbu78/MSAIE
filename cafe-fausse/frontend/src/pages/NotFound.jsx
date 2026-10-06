import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="container section" style={{ textAlign: 'center' }}>
      <h1>404</h1>
      <p>We couldn't find that page.</p>
      <Link to="/" className="btn">
        Back to Home
      </Link>
    </div>
  );
}

export default NotFound;
