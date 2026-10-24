from flask import Blueprint, jsonify, request
from flask.views import MethodView
from sqlalchemy.exc import SQLAlchemyError

from models import db
from services import (
    AdicionarProdutoCategoriaService,
    AtualizarCategoriaService,
    BuscarCategoriaService,
    CategoriaComProdutosError,
    CriarCategoriaService,
    DeletarCategoriaService,
    ListarCategoriasService,
    RemoverProdutoCategoriaService,
)

categoria_controller_bp = Blueprint("categoria_controller", __name__)


class CategoriasController(MethodView):
    def get(self):
        categorias = ListarCategoriasService().executar()
        return jsonify(categorias), 200

    def post(self):
        try:
            dados = request.get_json() or {}
            categoria = CriarCategoriaService().executar(dados)
            return jsonify(categoria), 201
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao salvar categoria no banco de dados."}), 500


class CategoriaController(MethodView):
    def get(self, categoria_id):
        try:
            categoria = BuscarCategoriaService().executar(categoria_id)
            return jsonify(categoria), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 404

    def put(self, categoria_id):
        try:
            dados = request.get_json() or {}
            categoria = AtualizarCategoriaService().executar(categoria_id, dados)
            return jsonify(categoria), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao atualizar categoria no banco de dados."}), 500

    def delete(self, categoria_id):
        try:
            DeletarCategoriaService().executar(categoria_id)
            return "", 204
        except CategoriaComProdutosError as erro:
            return jsonify({"erro": str(erro)}), 409
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 404
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao deletar categoria no banco de dados."}), 500


class ProdutosDaCategoriaController(MethodView):
    def post(self, categoria_id):
        try:
            dados = request.get_json() or {}
            categoria = AdicionarProdutoCategoriaService().executar(categoria_id, dados)
            return jsonify(categoria), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao adicionar produto à categoria."}), 500

    def delete(self, categoria_id):
        try:
            dados = request.get_json() or {}
            categoria = RemoverProdutoCategoriaService().executar(categoria_id, dados)
            return jsonify(categoria), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao remover produto da categoria."}), 500


categoria_controller_bp.add_url_rule(
    "/categorias",
    view_func=CategoriasController.as_view("categorias"),
)
categoria_controller_bp.add_url_rule(
    "/categorias/<int:categoria_id>",
    view_func=CategoriaController.as_view("categoria"),
)
categoria_controller_bp.add_url_rule(
    "/categorias/<int:categoria_id>/produtos",
    view_func=ProdutosDaCategoriaController.as_view("produtos_da_categoria"),
)
