from sqlalchemy import text
from models import db

class ProdutoRepository:
    @staticmethod
    def produtos_em_alta(limite=5):
        sql = text("""
            SELECT
                p.id,
                p.nome,
                p.descricao,
                c.nome AS categoria_nome,
                AVG(a.nota) AS media_notas,
                COUNT(a.id) AS total_avaliacoes
            FROM produtos p
            JOIN categorias c ON c.id = p.categoria_id
            JOIN avaliacoes a ON a.produto_id = p.id
            GROUP BY p.id, p.nome, p.descricao, c.nome
            ORDER BY COUNT(a.id) DESC, AVG(a.nota) DESC
            LIMIT :limite
        """)
        resultado = db.session.execute(sql, {"limite": limite})
        return [dict(linha) for linha in resultado.mappings()]

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
        sql = text("""
            SELECT
                p.id,
                p.nome,
                p.descricao,
                p.categoria_id,
                AVG(a.nota) AS media_notas,
                COUNT(a.id) AS total_avaliacoes
            FROM produtos p
            JOIN avaliacoes a ON a.produto_id = p.id
            GROUP BY p.id, p.nome, p.descricao, p.categoria_id
            ORDER BY AVG(a.nota) DESC
            LIMIT :limite
        """)
        resultado = db.session.execute(sql, {"limite": limite})
        return [dict(linha) for linha in resultado.mappings()]

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
        sql = text("""
            SELECT
                p.id,
                p.nome,
                p.descricao,
                c.nome AS categoria_nome
            FROM produtos p
            JOIN categorias c ON c.id = p.categoria_id
            WHERE p.categoria_id = :categoria_id
            ORDER BY p.nome ASC
        """)
        resultado = db.session.execute(sql, {"categoria_id": categoria_id})
        return [dict(linha) for linha in resultado.mappings()]
