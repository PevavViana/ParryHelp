from flask import Blueprint, jsonify, request
from flask.views import MethodView
from sqlalchemy.exc import SQLAlchemyError

from models import db
from services import (
    AtualizarProdutoService,
    BuscarProdutoService,
    CriarProdutoService,
    DeletarProdutoService,
    ListarProdutosService,
    ProdutosMaisAvaliadosService,
    ProdutosPorCategoriaService,
)

produto_controller_bp = Blueprint("produto_controller", __name__)


class ProdutosController(MethodView):
    def get(self):
        produtos = ListarProdutosService().executar()
        return jsonify(produtos), 200

    def post(self):
        try:
            dados = request.get_json() or {}
            produto = CriarProdutoService().executar(dados)
            return jsonify(produto), 201
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao salvar produto no banco de dados."}), 500


class ProdutoController(MethodView):
    def get(self, produto_id):
        try:
            produto = BuscarProdutoService().executar(produto_id)
            return jsonify(produto), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 404

    def put(self, produto_id):
        try:
            dados = request.get_json() or {}
            produto = AtualizarProdutoService().executar(produto_id, dados)
            return jsonify(produto), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao atualizar produto no banco de dados."}), 500

    def delete(self, produto_id):
        try:
            DeletarProdutoService().executar(produto_id)
            return "", 204
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 404
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao deletar produto no banco de dados."}), 500


class ProdutosMaisAvaliadosController(MethodView):
    def get(self):
        limite = request.args.get("limite", default=5, type=int)
        produtos = ProdutosMaisAvaliadosService().executar(limite)
        return jsonify(produtos), 200


class ProdutosPorCategoriaController(MethodView):
    def get(self, categoria_id):
        try:
            produtos = ProdutosPorCategoriaService().executar(categoria_id)
            return jsonify(produtos), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 404


produto_controller_bp.add_url_rule(
    "/produtos",
    view_func=ProdutosController.as_view("produtos"),
)
produto_controller_bp.add_url_rule(
    "/produtos/<int:produto_id>",
    view_func=ProdutoController.as_view("produto"),
)
produto_controller_bp.add_url_rule(
    "/produtos/mais-avaliados",
    view_func=ProdutosMaisAvaliadosController.as_view("produtos_mais_avaliados"),
)
produto_controller_bp.add_url_rule(
    "/categorias/<int:categoria_id>/produtos",
    view_func=ProdutosPorCategoriaController.as_view("produtos_por_categoria"),
)
