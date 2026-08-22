from models import Produto, Categoria

class CriarProdutoService:
    def executar(self, dados):
        categoria_id = dados.get("categoria_id")
        if not categoria_id:
            raise ValueError("Categoria é obrigatória")

        if Categoria.buscar_por_id(categoria_id) is None:
            raise ValueError("Categoria não encontrada")

        produto = Produto(
            nome=dados.get("nome"),
            descricao=dados.get("descricao"),
            categoria_id=categoria_id,
        )
        
        produto.salvar()
        return produto.to_dict()