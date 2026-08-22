from sqlalchemy import text
from models import db, Avaliacao

class AvaliacaoRepository:
    @staticmethod
    def por_produto(produto_id, limite=10):
        avaliacoes = (
            Avaliacao.query
            .filter(Avaliacao.produto_id == produto_id)
            .order_by(Avaliacao.nota.desc(), Avaliacao.data.desc())
            .limit(limite)
            .all()
        )
        return [avaliacao.to_dict() for avaliacao in avaliacoes]

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
        avaliacoes = (
            Avaliacao.query
            .filter(Avaliacao.usuario_id == usuario_id)
            .order_by(Avaliacao.data.desc())
            .all()
        )
        return [
            {
                "id": avaliacao.id,
                "titulo": avaliacao.titulo,
                "descricao": avaliacao.descricao,
                "nota": avaliacao.nota,
                "data": avaliacao.data.isoformat(),
                "produto_nome": avaliacao.produto.nome,
            }
            for avaliacao in avaliacoes
        ]