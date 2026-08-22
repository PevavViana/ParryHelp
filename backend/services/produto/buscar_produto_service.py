from models import Produto

class BuscarProdutoService:
    def executar(self, produto_id):
        produto = Produto.buscar_por_id(produto_id)
        if produto is None:
            raise ValueError("Produto não encontrado")
        return produto.to_dict()