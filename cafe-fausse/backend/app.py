from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from extensions import db
from routes.newsletter import newsletter_bp
from routes.reservations import reservations_bp


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})

    app.register_blueprint(reservations_bp)
    app.register_blueprint(newsletter_bp)

    @app.route("/api/health")
    def health():
        return jsonify({"status": "ok"})

    return app


app = create_app()

if __name__ == "__main__":
    with app.app_context():
        # Convenience for local dev: auto-create tables if they don't exist.
        # For anything beyond local dev, prefer an explicit migration tool.
        db.create_all()
    app.run(debug=True, port=5001)
