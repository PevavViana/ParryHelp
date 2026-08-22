from models import Categoria
from repositories import ProdutoRepository

class ProdutosPorCategoriaService:
    def executar(self, categoria_id):
        if Categoria.buscar_por_id(categoria_id) is None:
            raise ValueError("Categoria não encontrada")

        return ProdutoRepository.produtos_por_categoria(categoria_id)