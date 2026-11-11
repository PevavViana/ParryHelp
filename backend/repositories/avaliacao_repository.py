from sqlalchemy import text
from models import db


class AvaliacaoRepository:
    @staticmethod
    def por_produto(produto_id, limite=10):
        sql = text("""
            SELECT id, titulo, descricao, nota, data, usuario_id, produto_id
            FROM avaliacoes
            WHERE produto_id = :produto_id
            ORDER BY data DESC
            LIMIT :limite
        """)

        resultado = db.session.execute(
            sql,
            {"produto_id": produto_id, "limite": limite},
        )

        avaliacoes = []
        for linha in resultado.mappings():
            avaliacao = dict(linha)
            if hasattr(avaliacao["data"], "isoformat"):
                avaliacao["data"] = avaliacao["data"].isoformat()
            avaliacoes.append(avaliacao)
        return avaliacoes

    @staticmethod
    def historico_por_usuario(usuario_id):
        banco = db.session.get_bind().dialect.name
        if banco == "mysql":
            sql = text("CALL sp_historico_avaliacoes_usuario(:usuario_id)")
            resultado = db.session.execute(sql, {"usuario_id": usuario_id})
            linhas = resultado.mappings().all()
            resultado.close()

            avaliacoes = []
            for linha in linhas:
                avaliacao = dict(linha)
                if avaliacao.get("data") is not None:
                    avaliacao["data"] = avaliacao["data"].isoformat()
                avaliacoes.append(avaliacao)
            return avaliacoes

        # OBS: Esse bloco serve pra facilitar os testes locais com o SQLite em sala
        sql = text("""
            SELECT
                a.id,
                a.titulo,
                a.descricao,
                a.nota,
                a.data,
                p.nome AS produto_nome
            FROM avaliacoes a
            JOIN produtos p ON p.id = a.produto_id
            WHERE a.usuario_id = :usuario_id
            ORDER BY a.data DESC
        """)
        resultado = db.session.execute(sql, {"usuario_id": usuario_id})
        return [dict(linha) for linha in resultado.mappings()]
