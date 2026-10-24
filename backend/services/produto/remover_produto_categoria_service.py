from models import Categoria, Produto

class RemoverProdutoCategoriaService:
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

        if produto.categoria_id != categoria.id:
            raise ValueError("Produto não está nessa categoria")

        nova_categoria_id = dados.get("nova_categoria_id")
        if (
            isinstance(nova_categoria_id, bool)
            or not isinstance(nova_categoria_id, int)
            or nova_categoria_id < 1
        ):
            raise ValueError("Informe a categoria para onde o produto será movido")

        nova_categoria = Categoria.buscar_por_id(nova_categoria_id)
        if nova_categoria is None:
            raise ValueError("Nova categoria não encontrada")
        if nova_categoria.id == categoria.id:
            raise ValueError("Escolha uma categoria diferente da atual")

        produto.atualizar(categoria_id=nova_categoria.id)

        return categoria.to_dict()
