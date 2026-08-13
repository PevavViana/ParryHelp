from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services import AdicionarProdutoCategoriaService, RemoverProdutoCategoriaService, AtualizarCategoriaService
from models import db, Categoria

categoria_controller_bp = Blueprint("categoria_controller", __name__)

@categoria_controller_bp.post("/categorias")
def criar_categoria():
    try:
        dados = request.get_json() or {}
        categoria = Categoria(nome=dados.get("nome"))
        categoria.salvar()
        return jsonify(categoria.to_dict()), 201

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao salvar categoria no banco de dados."}), 500

@categoria_controller_bp.get("/categorias")
def listar_categorias():
    categorias = Categoria.listar_todos()
    return jsonify([categoria.to_dict() for categoria in categorias]), 200

@categoria_controller_bp.get("/categorias/<int:categoria_id>")
def buscar_categoria_por_id(categoria_id):
    categoria = Categoria.buscar_por_id(categoria_id)
    if categoria is None:
        return jsonify({"erro": "Categoria não encontrada."}), 404

    return jsonify(categoria.to_dict()), 200

@categoria_controller_bp.delete("/categorias/<int:categoria_id>")
def deletar_categoria(categoria_id):
    try:
        categoria = Categoria.buscar_por_id(categoria_id)
        if categoria is None:
            return jsonify({"erro": "Categoria não encontrada."}), 404
        categoria.deletar()
        return "", 204

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar categoria no banco de dados."}), 500

@categoria_controller_bp.post("/categorias/<int:categoria_id>/produtos")
def adicionar_produto(categoria_id):
    try:
        dados = request.get_json() or {}
        service = AdicionarProdutoCategoriaService()
        categoria = service.executar(categoria_id, dados)
        return jsonify(categoria), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao adicionar produto à categoria."}), 500

@categoria_controller_bp.delete("/categorias/<int:categoria_id>/produtos")
def remover_produto(categoria_id):
    try:
        dados = request.get_json() or {}
        service = RemoverProdutoCategoriaService()
        categoria = service.executar(categoria_id, dados)
        return jsonify(categoria), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400
        
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao remover produto da categoria."}), 500

@categoria_controller_bp.put("/categorias/<int:categoria_id>")
def atualizar_categoria(categoria_id):
    try:
        dados = request.get_json() or {}
        service = AtualizarCategoriaService()
        categoria = service.executar(categoria_id, dados)
        return jsonify(categoria), 200
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar categoria no banco de dados."}),