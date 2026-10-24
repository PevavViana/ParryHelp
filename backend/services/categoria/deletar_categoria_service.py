from models import Categoria


class CategoriaComProdutosError(ValueError):
    pass


class DeletarCategoriaService:
    def executar(self, categoria_id):
        categoria = Categoria.buscar_por_id(categoria_id)
        if categoria is None:
            raise ValueError("Categoria não encontrada")
        if categoria.produtos:
            raise CategoriaComProdutosError(
                "A categoria possui produtos. Mova ou exclua os produtos antes."
            )
        categoria.deletar()
