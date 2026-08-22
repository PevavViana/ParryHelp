from models import Produto

class DeletarProdutoService:
    def executar(self, produto_id):
        produto = Produto.buscar_por_id(produto_id)
        if produto is None:
            raise ValueError("Produto não encontrado")
        produto.deletar()