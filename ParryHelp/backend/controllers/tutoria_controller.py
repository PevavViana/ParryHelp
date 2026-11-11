from flask import Blueprint, jsonify, request
from flask.views import MethodView

from services import (
    ResumoAvaliacoesProdutoService,
    ResumoProdutosEmAltaService,
)

tutoria_controller_bp = Blueprint("tutoria_controller", __name__)


class TutoriaController(MethodView):
    def post(self):
        dados = request.get_json(silent=True)
        if not isinstance(dados, dict):
            return jsonify({"erro": "JSON inválido"}), 400

        tipo = dados.get("tipo")
        if tipo == "produtos_em_alta":
            service = ResumoProdutosEmAltaService()
            campos = {"limite": dados.get("limite", 5)}
        elif tipo == "avaliacoes_relevantes":
            service = ResumoAvaliacoesProdutoService()
            campos = {
                "produto_id": dados.get("produto_id"),
                "limite": dados.get("limite", 10),
            }
        else:
            return jsonify({"erro": "Tipo de tutoria inválido."}), 400

        try:
            return jsonify(service.executar(**campos)), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400
        except RuntimeError as erro:
            return jsonify({"erro": str(erro)}), 502


tutoria_controller_bp.add_url_rule(
    "/api/tutoria",
    view_func=TutoriaController.as_view("tutoria"),
)
