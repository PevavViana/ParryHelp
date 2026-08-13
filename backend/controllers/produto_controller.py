from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError
from models import db, Produto

from services import AtualizarProdutoService

produto_controller_bp = Blueprint("produto_controller", __name__)

@produto_controller_bp.post("/produtos")
def criar_produto():
    try:
        dados = request.get_json() or {}
        produto = Produto(
            nome=dados.get("nome"),
            descricao=dados.get("descricao"),
            categoria_id=dados.get("categoria_id"),
        )
        produto.salvar()
        return jsonify(produto.to_dict()), 201

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao salvar produto no banco de dados."}), 500

@produto_controller_bp.get("/produtos")
def listar_produtos():
    produtos = Produto.listar_todos()
    return jsonify([produto.to_dict() for produto in produtos]), 200

@produto_controller_bp.get("/produtos/<int:produto_id>")
def buscar_produto_por_id(produto_id):
    produto = Produto.buscar_por_id(produto_id)
    if produto is None:
        return jsonify({"erro": "Produto não encontrado."}), 404

    return jsonify(produto.to_dict()), 200

@produto_controller_bp.delete("/produtos/<int:produto_id>")
def deletar_produto(produto_id):
    try:
        produto = Produto.buscar_por_id(produto_id)
        if produto is None:
            return jsonify({"erro": "Produto não encontrado."}), 404
        produto.deletar()
        return "", 204
        
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar produto no banco de dados."}), 500

@produto_controller_bp.put("/produtos/<int:produto_id>")
def atualizar_produto(produto_id):
    try:
        dados = request.get_json() or {}
        service = AtualizarProdutoService()
        produto = service.executar(produto_id, dados)
        return jsonify(produto), 200
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar produto no banco de dados."}), 500