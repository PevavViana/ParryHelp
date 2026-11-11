from flask import Blueprint, jsonify, request
from flask.views import MethodView
from sqlalchemy.exc import SQLAlchemyError

from models import db
from services import (
    AtualizarUsuarioService,
    BuscarUsuarioService,
    CadastrarUsuarioService,
    DeletarUsuarioService,
    ListarUsuariosService,
    LoginUsuarioService,
)

usuario_controller_bp = Blueprint("usuario_controller", __name__)


class UsuariosController(MethodView):
    def get(self):
        usuarios = ListarUsuariosService().executar()
        return jsonify(usuarios), 200

    def post(self):
        try:
            dados = request.get_json() or {}
            usuario = CadastrarUsuarioService().executar(dados)
            return jsonify(usuario), 201
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao salvar usuário no banco de dados."}), 500


class LoginUsuarioController(MethodView):
    def post(self):
        try:
            dados = request.get_json() or {}
            usuario = LoginUsuarioService().executar(dados)
            return jsonify(usuario), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 401


class UsuarioController(MethodView):
    def get(self, usuario_id):
        try:
            usuario = BuscarUsuarioService().executar(usuario_id)
            return jsonify(usuario), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 404

    def put(self, usuario_id):
        try:
            dados = request.get_json() or {}
            usuario = AtualizarUsuarioService().executar(usuario_id, dados)
            return jsonify(usuario), 200
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 400
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao atualizar usuário no banco de dados."}), 500

    def delete(self, usuario_id):
        try:
            DeletarUsuarioService().executar(usuario_id)
            return "", 204
        except ValueError as erro:
            return jsonify({"erro": str(erro)}), 404
        except SQLAlchemyError:
            db.session.rollback()
            return jsonify({"erro": "Erro ao deletar usuário no banco de dados."}), 500


usuario_controller_bp.add_url_rule(
    "/usuarios",
    view_func=UsuariosController.as_view("usuarios"),
)
usuario_controller_bp.add_url_rule(
    "/usuarios/login",
    view_func=LoginUsuarioController.as_view("login_usuario"),
)
usuario_controller_bp.add_url_rule(
    "/usuarios/<int:usuario_id>",
    view_func=UsuarioController.as_view("usuario"),
)
