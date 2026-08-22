from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services import (
    CriarAvaliacaoService, AtualizarAvaliacaoService,
    ListarAvaliacoesService, BuscarAvaliacaoService, DeletarAvaliacaoService,
    HistoricoAvaliacoesUsuarioService,
)

from models import db

avaliacao_controller_bp = Blueprint("avaliacao_controller", __name__)

@avaliacao_controller_bp.post("/usuarios/<int:usuario_id>/avaliacoes")
def criar_avaliacao(usuario_id):
    try:
        dados = request.get_json() or {}
        avaliacao = CriarAvaliacaoService().executar(usuario_id, dados)
        return jsonify(avaliacao), 201
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao salvar avaliação no banco de dados."}), 500

@avaliacao_controller_bp.get("/avaliacoes")
def listar_avaliacoes():
    avaliacoes = ListarAvaliacoesService().executar()
    return jsonify(avaliacoes), 200

@avaliacao_controller_bp.get("/avaliacoes/<int:avaliacao_id>")
def buscar_avaliacao_por_id(avaliacao_id):
    try:
        avaliacao = BuscarAvaliacaoService().executar(avaliacao_id)
        return jsonify(avaliacao), 200
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 404

@avaliacao_controller_bp.put("/avaliacoes/<int:avaliacao_id>")
def atualizar_avaliacao(avaliacao_id):
    try:
        dados = request.get_json() or {}
        avaliacao = AtualizarAvaliacaoService().executar(avaliacao_id, dados)
        return jsonify(avaliacao), 200
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar avaliação no banco de dados."}), 500

@avaliacao_controller_bp.delete("/avaliacoes/<int:avaliacao_id>")
def deletar_avaliacao(avaliacao_id):
    try:
        DeletarAvaliacaoService().executar(avaliacao_id)
        return "", 204
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 404
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar avaliação no banco de dados."}), 500

@avaliacao_controller_bp.get("/usuarios/<int:usuario_id>/avaliacoes")
def historico_avaliacoes_usuario(usuario_id):
    try:
        avaliacoes = HistoricoAvaliacoesUsuarioService().executar(usuario_id)
        return jsonify(avaliacoes), 200
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 404