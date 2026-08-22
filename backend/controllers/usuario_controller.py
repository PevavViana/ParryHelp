from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services import (
    CadastrarUsuarioService, LoginUsuarioService, AtualizarUsuarioService,
    ListarUsuariosService, BuscarUsuarioService, DeletarUsuarioService,
)
from models import db

usuario_controller_bp = Blueprint("usuario_controller", __name__)

@usuario_controller_bp.post("/usuarios")
def cadastrar_usuario():
    try:
        dados = request.get_json() or {}
        usuario = CadastrarUsuarioService().executar(dados)
        return jsonify(usuario), 201
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao salvar usuário no banco de dados."}), 500

@usuario_controller_bp.post("/usuarios/login")
def login_usuario():
    try:
        dados = request.get_json() or {}
        usuario = LoginUsuarioService().executar(dados)
        return jsonify(usuario), 200
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 401

@usuario_controller_bp.get("/usuarios")
def listar_usuarios():
    usuarios = ListarUsuariosService().executar()
    return jsonify(usuarios), 200

@usuario_controller_bp.get("/usuarios/<int:usuario_id>")
def buscar_usuario_por_id(usuario_id):
    try:
        usuario = BuscarUsuarioService().executar(usuario_id)
        return jsonify(usuario), 200
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 404

@usuario_controller_bp.put("/usuarios/<int:usuario_id>")
def atualizar_usuario(usuario_id):
    try:
        dados = request.get_json() or {}
        usuario = AtualizarUsuarioService().executar(usuario_id, dados)
        return jsonify(usuario), 200
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar usuário no banco de dados."}), 500

@usuario_controller_bp.delete("/usuarios/<int:usuario_id>")
def deletar_usuario(usuario_id):
    try:
        DeletarUsuarioService().executar(usuario_id)
        return "", 204
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 404
    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar usuário no banco de dados."}), 500