from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError
from models import db

from services import (
    AtualizarProdutoService, CriarProdutoService,
    ListarProdutosService, BuscarProdutoService, DeletarProdutoService,
    ProdutosMaisAvaliadosService, ProdutosPorCategoriaService,
)

produto_controller_bp = Blueprint("produto_controller", __name__)

@produto_controller_bp.post("/produtos")
def criar_produto():
    try:
        dados = request.get_json() or {}
        produto = CriarProdutoService().executar(dados)
        return jsonify(produto), 201
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao salvar produto no banco de dados."}), 500

@produto_controller_bp.get("/produtos")
def listar_produtos():
    produtos = ListarProdutosService().executar()
    return jsonify(produtos), 200

@produto_controller_bp.get("/produtos/<int:produto_id>")
def buscar_produto_por_id(produto_id):
    try:
        produto = BuscarProdutoService().executar(produto_id)
        return jsonify(produto), 200
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 404

@produto_controller_bp.delete("/produtos/<int:produto_id>")
def deletar_produto(produto_id):
    try:
        DeletarProdutoService().executar(produto_id)
        return "", 204
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 404
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar produto no banco de dados."}), 500

@produto_controller_bp.put("/produtos/<int:produto_id>")
def atualizar_produto(produto_id):
    try:
        dados = request.get_json() or {}
        produto = AtualizarProdutoService().executar(produto_id, dados)
        return jsonify(produto), 200
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar produto no banco de dados."}), 500

@produto_controller_bp.get("/produtos/mais-avaliados")
def produtos_mais_avaliados():
    limite = request.args.get("limite", default=5, type=int)
    produtos = ProdutosMaisAvaliadosService().executar(limite)
    return jsonify(produtos), 200

@produto_controller_bp.get("/categorias/<int:categoria_id>/produtos")
def produtos_por_categoria(categoria_id):
    try:
        produtos = ProdutosPorCategoriaService().executar(categoria_id)
        return jsonify(produtos), 200
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 404