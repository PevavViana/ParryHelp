from models import Categoria

class BuscarCategoriaService:
    def executar(self, categoria_id):
        categoria = Categoria.buscar_por_id(categoria_id)
        if categoria is None:
            raise ValueError("Categoria não encontrada")
        return categoria.to_dict()