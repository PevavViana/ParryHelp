from sqlalchemy import text, func
from models import db, Produto, Avaliacao, Categoria

class ProdutoRepository:
    @staticmethod
    def produtos_em_alta(limite=5):
        resultado = (
            db.session.query(
                Produto.id,
                Produto.nome,
                Produto.descricao,
                Categoria.nome.label("categoria_nome"),
                func.avg(Avaliacao.nota).label("media_notas"),
                func.count(Avaliacao.id).label("total_avaliacoes"),
            )
            .join(Categoria, Categoria.id == Produto.categoria_id)
            .join(Avaliacao, Avaliacao.produto_id == Produto.id)
            .group_by(Produto.id, Produto.nome, Produto.descricao, Categoria.nome)
            .order_by(func.count(Avaliacao.id).desc(), func.avg(Avaliacao.nota).desc())
            .limit(limite)
            .all()
        )
        return [dict(linha._mapping) for linha in resultado]

    @staticmethod
    def produtos_mais_avaliados(limite=5):
        banco = db.session.get_bind().dialect.name
        if banco == "mysql":
            sql = text("CALL sp_produtos_mais_avaliados(:limite)")
            resultado = db.session.execute(sql, {"limite": limite})
            linhas = resultado.mappings().all()
            resultado.close()
            return [dict(linha) for linha in linhas]

        # OBS: Esse bloco serve pra facilitar os testes locais com o SQLite em sala
        resultado = (
            db.session.query(
                Produto.id,
                Produto.nome,
                Produto.descricao,
                Produto.categoria_id,
                func.avg(Avaliacao.nota).label("media_notas"),
                func.count(Avaliacao.id).label("total_avaliacoes"),
            )
            .join(Avaliacao, Avaliacao.produto_id == Produto.id)
            .group_by(Produto.id, Produto.nome, Produto.descricao, Produto.categoria_id)
            .order_by(func.avg(Avaliacao.nota).desc())
            .limit(limite)
            .all()
        )
        return [dict(linha._mapping) for linha in resultado]

    @staticmethod
    def produtos_por_categoria(categoria_id):
        banco = db.session.get_bind().dialect.name
        if banco == "mysql":
            sql = text("CALL sp_produtos_por_categoria(:categoria_id)")
            resultado = db.session.execute(sql, {"categoria_id": categoria_id})
            linhas = resultado.mappings().all()
            resultado.close()
            return [dict(linha) for linha in linhas]

        # OBS: Esse bloco serve pra facilitar os testes locais com o SQLite em sala
        produtos = (
            Produto.query
            .filter(Produto.categoria_id == categoria_id)
            .order_by(Produto.nome.asc())
            .all()
        )
        return [
            {
                "id": produto.id,
                "nome": produto.nome,
                "descricao": produto.descricao,
                "categoria_nome": produto.categoria.nome,
            }
            for produto in produtos
        ]