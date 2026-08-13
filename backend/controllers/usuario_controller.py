from flask import Blueprint, jsonify, request
from sqlalchemy.exc import SQLAlchemyError

from services import CadastrarUsuarioService, LoginUsuarioService, AtualizarUsuarioService
from models import db, Usuario

usuario_controller_bp = Blueprint("usuario_controller", __name__)

@usuario_controller_bp.post("/usuarios")
def cadastrar_usuario():
    try:
        dados = request.get_json() or {}
        service = CadastrarUsuarioService()
        usuario = service.executar(dados)
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
        service = LoginUsuarioService()
        usuario = service.executar(dados)
        return jsonify(usuario), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 401

@usuario_controller_bp.get("/usuarios")
def listar_usuarios():
    usuarios = Usuario.listar_todos()
    return jsonify([usuario.to_dict() for usuario in usuarios]), 200

@usuario_controller_bp.get("/usuarios/<int:usuario_id>")
def buscar_usuario_por_id(usuario_id):
    usuario = Usuario.buscar_por_id(usuario_id)
    if usuario is None:
        return jsonify({"erro": "Usuário não encontrado."}), 404

    return jsonify(usuario.to_dict()), 200

@usuario_controller_bp.put("/usuarios/<int:usuario_id>")
def atualizar_usuario(usuario_id):
    try:
        dados = request.get_json() or {}
        service = AtualizarUsuarioService()
        usuario = service.executar(usuario_id, dados)
        return jsonify(usuario), 200

    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao atualizar usuário no banco de dados."}), 500

@usuario_controller_bp.delete("/usuarios/<int:usuario_id>")
def deletar_usuario(usuario_id):
    try:
        usuario = Usuario.buscar_por_id(usuario_id)
        if usuario is None:
            return jsonify({"erro": "Usuário não encontrado."}), 404

        usuario.deletar()
        return "", 204

    except SQLAlchemyError:
        db.session.rollback()
        return jsonify({"erro": "Erro ao deletar usuário no banco de dados."}), 500