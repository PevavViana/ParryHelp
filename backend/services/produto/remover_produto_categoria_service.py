from models import Categoria, Produto

class RemoverProdutoCategoriaService:
    def executar(self, categoria_id, dados):
        categoria = Categoria.buscar_por_id(categoria_id)
        if categoria is None:
            raise ValueError("Categoria não encontrada")

        produto = Produto.buscar_por_id(dados.get("produto_id"))
        if produto is None:
            raise ValueError("Produto não encontrado")

        sucesso = categoria.remover_produto(produto)
        if not sucesso:
            raise ValueError("Produto não está nessa categoria")

        return categoria.to_dict()