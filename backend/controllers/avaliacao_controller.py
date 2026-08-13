from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services import CriarAvaliacaoService, AtualizarAvaliacaoService
from models import db, Avaliacao

avaliacao_controller_bp = Blueprint("avaliacao_controller", __name__)

@avaliacao_controller_bp.post("/usuarios/<int:usuario_id>/avaliacoes")
def criar_avaliacao(usuario_id):
    try:
        dados = request.get_json() or {}
        service = CriarAvaliacaoService()
        avaliacao = service.executar(usuario_id, dados)
        return jsonify(avaliacao), 201

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao salvar avaliação no banco de dados."}), 500

@avaliacao_controller_bp.get("/avaliacoes")
def listar_avaliacoes():
    avaliacoes = Avaliacao.listar_todos()
    return jsonify([avaliacao.to_dict() for avaliacao in avaliacoes]), 200

@avaliacao_controller_bp.get("/avaliacoes/<int:avaliacao_id>")
def buscar_avaliacao_por_id(avaliacao_id):
    avaliacao = Avaliacao.buscar_por_id(avaliacao_id)
    if avaliacao is None:
        return jsonify({"erro": "Avaliação não encontrada."}), 404

    return jsonify(avaliacao.to_dict()), 200

@avaliacao_controller_bp.put("/avaliacoes/<int:avaliacao_id>")
def atualizar_avaliacao(avaliacao_id):
    try:
        dados = request.get_json() or {}
        service = AtualizarAvaliacaoService()
        avaliacao = service.executar(avaliacao_id, dados)
        return jsonify(avaliacao), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar avaliação no banco de dados."}), 500

@avaliacao_controller_bp.delete("/avaliacoes/<int:avaliacao_id>")
def deletar_avaliacao(avaliacao_id):
    try:
        avaliacao = Avaliacao.buscar_por_id(avaliacao_id)
        if avaliacao is None:
            return jsonify({"erro": "Avaliação não encontrada."}), 404
        avaliacao.deletar()
        return "", 204
        
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar avaliação no banco de dados."}), 500