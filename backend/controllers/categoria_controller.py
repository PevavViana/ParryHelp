from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services import (
    AdicionarProdutoCategoriaService, RemoverProdutoCategoriaService, AtualizarCategoriaService,
    CriarCategoriaService, ListarCategoriasService, BuscarCategoriaService, DeletarCategoriaService,
)
from models import db

categoria_controller_bp = Blueprint("categoria_controller", __name__)

@categoria_controller_bp.post("/categorias")
def criar_categoria():
    try:
        dados = request.get_json() or {}
        categoria = CriarCategoriaService().executar(dados)
        return jsonify(categoria), 201
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao salvar categoria no banco de dados."}), 500

@categoria_controller_bp.get("/categorias")
def listar_categorias():
    categorias = ListarCategoriasService().executar()
    return jsonify(categorias), 200

@categoria_controller_bp.get("/categorias/<int:categoria_id>")
def buscar_categoria_por_id(categoria_id):
    try:
        categoria = BuscarCategoriaService().executar(categoria_id)
        return jsonify(categoria), 200
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 404

@categoria_controller_bp.delete("/categorias/<int:categoria_id>")
def deletar_categoria(categoria_id):
    try:
        DeletarCategoriaService().executar(categoria_id)
        return "", 204
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 404
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar categoria no banco de dados."}), 500

@categoria_controller_bp.post("/categorias/<int:categoria_id>/produtos")
def adicionar_produto(categoria_id):
    try:
        dados = request.get_json() or {}
        categoria = AdicionarProdutoCategoriaService().executar(categoria_id, dados)
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
        categoria = RemoverProdutoCategoriaService().executar(categoria_id, dados)
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
        categoria = AtualizarCategoriaService().executar(categoria_id, dados)
        return jsonify(categoria), 200
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar categoria no banco de dados."}), 500