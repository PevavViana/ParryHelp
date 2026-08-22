from flask import Blueprint, jsonify, request

from services import (
    ResumoProdutosEmAltaService,
    ResumoAvaliacoesProdutoService,
)

tutoria_controller_bp = Blueprint("tutoria_controller", __name__)

@tutoria_controller_bp.post("/api/tutoria")
def criar_tutoria():
    dados = request.get_json(silent=True)

    if not isinstance(dados, dict):
        return jsonify({"erro": "JSON inválido"}), 400

    tipo = dados.get("tipo")

    if tipo == "produtos_em_alta":
        limite = dados.get("limite", 5)
        if not isinstance(limite, int) or limite < 1 or limite > 10:
            return jsonify({"erro": "O campo 'limite' deve ser um número entre 1 e 10."}), 400
        service = ResumoProdutosEmAltaService()
        campos = {"limite": limite}
    elif tipo == "avaliacoes_relevantes":
        produto_id = dados.get("produto_id")
        limite = dados.get("limite", 10)
        if not isinstance(produto_id, int) or produto_id < 1:
            return jsonify({"erro": "O campo 'produto_id' é obrigatório."}), 400
        if not isinstance(limite, int) or limite < 1 or limite > 20:
            return jsonify({"erro": "O campo 'limite' deve ser um número entre 1 e 20."}), 400
        service = ResumoAvaliacoesProdutoService()
        campos = {"produto_id": produto_id, "limite": limite}
    else:
        return jsonify({"erro": "Tipo de tutoria inválido."}), 400

    try:
        return jsonify(service.executar(**campos)), 200
    except ValueError as erro:
        return jsonify({"erro": str(erro)}), 400
    except RuntimeError as erro:
        return jsonify({"erro": str(erro)}), 502
