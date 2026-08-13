import os

from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS

from models import db
from controllers import (
    usuario_controller_bp,
    avaliacao_controller_bp,
    produto_controller_bp,
    categoria_controller_bp,
)

def create_app():
    load_dotenv()

    app = Flask(__name__)
    CORS(app)

    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///parryhelp.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    app.register_blueprint(usuario_controller_bp)
    app.register_blueprint(avaliacao_controller_bp)
    app.register_blueprint(produto_controller_bp)
    app.register_blueprint(categoria_controller_bp)

    @app.get("/")
    def home():
        return jsonify({
            "mensagem": "API Flask + SQLAlchemy funcionando.",
            "rotas": {
                "usuarios": "GET/POST /usuarios, GET/PUT/DELETE /usuarios/<id>",
                "login": "POST /usuarios/login",
                "avaliacoes": "GET /avaliacoes, GET/PUT/DELETE /avaliacoes/<id>",
                "criar_avaliacao": "POST /usuarios/<usuario_id>/avaliacoes",
                "produtos": "GET/POST /produtos, GET/DELETE /produtos/<id>",
                "categorias": "GET/POST /categorias, GET/DELETE /categorias/<id>",
                "adicionar_produto_categoria": "POST /categorias/<id>/produtos",
                "remover_produto_categoria": "DELETE /categorias/<id>/produtos",
            }
        })

    with app.app_context():
        db.create_all()

    return app

app = create_app()

if __name__ == "__main__":
    debug = os.getenv("FLASK_DEBUG", "True") == "True"
    app.run(debug=debug, host="0.0.0.0", port=5000)