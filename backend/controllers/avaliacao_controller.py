from flask import Blueprint, jsonify, request
from flask.views import MethodView
from sqlalchemy.exc import SQLAlchemyError

from models import db
from services import (
    AtualizarAvaliacaoService,
    BuscarAvaliacaoService,
    CriarAvaliacaoService,
    DeletarAvaliacaoService,
    HistoricoAvaliacoesUsuarioService,
    ListarAvaliacoesService,
)

avaliacao_controller_bp = Blueprint("avaliacao_controller", __name__)


class AvaliacoesController(MethodView):
    def get(self):
        avaliacoes = ListarAvaliacoesService().executar()
        return jsonify(avaliacoes), 200


class AvaliacoesUsuarioController(MethodView):
    def get(self, usuario_id):
        try:
            avaliacoes = HistoricoAvaliacoesUsuarioService().executar(usuario_id)
            return jsonify(avaliacoes), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 404

    def post(self, usuario_id):
        try:
            dados = request.get_json() or {}
            avaliacao = CriarAvaliacaoService().executar(usuario_id, dados)
            return jsonify(avaliacao), 201
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao salvar avaliação no banco de dados."}), 500


class AvaliacaoController(MethodView):
    def get(self, avaliacao_id):
        try:
            avaliacao = BuscarAvaliacaoService().executar(avaliacao_id)
            return jsonify(avaliacao), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 404

    def put(self, avaliacao_id):
        try:
            dados = request.get_json() or {}
            avaliacao = AtualizarAvaliacaoService().executar(avaliacao_id, dados)
            return jsonify(avaliacao), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao atualizar avaliação no banco de dados."}), 500

    def delete(self, avaliacao_id):
        try:
            DeletarAvaliacaoService().executar(avaliacao_id)
            return "", 204
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 404
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao deletar avaliação no banco de dados."}), 500


avaliacao_controller_bp.add_url_rule(
    "/avaliacoes",
    view_func=AvaliacoesController.as_view("avaliacoes"),
)
avaliacao_controller_bp.add_url_rule(
    "/usuarios/<int:usuario_id>/avaliacoes",
    view_func=AvaliacoesUsuarioController.as_view("avaliacoes_usuario"),
)
avaliacao_controller_bp.add_url_rule(
    "/avaliacoes/<int:avaliacao_id>",
    view_func=AvaliacaoController.as_view("avaliacao"),
)
