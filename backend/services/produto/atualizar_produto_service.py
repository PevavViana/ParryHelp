from models import Produto

class AtualizarProdutoService:
    def executar(self, id, dados):
        produto = Produto.buscar_por_id(id)

        if produto is None:
            raise ValueError("Produto não encontrado")

        produto.atualizar(
            nome=dados.get("nome"),
            descricao=dados.get("descricao"),
        )
        return produto.to_dict()