from models import Categoria, Produto

class AdicionarProdutoCategoriaService:
    def executar(self, categoria_id, dados):
        if not isinstance(dados, dict):
            raise ValueError("Envie os dados do produto em formato JSON.")

        categoria = Categoria.buscar_por_id(categoria_id)
        if categoria is None:
            raise ValueError("Categoria não encontrada")

        produto_id = dados.get("produto_id")
        if isinstance(produto_id, bool) or not isinstance(produto_id, int) or produto_id < 1:
            raise ValueError("Produto é obrigatório")

        produto = Produto.buscar_por_id(produto_id)
        if produto is None:
            raise ValueError("Produto não encontrado")

        sucesso = categoria.adicionar_produto(produto)
        if not sucesso:
            raise ValueError("Produto já está nessa categoria")

        return categoria.to_dict()
