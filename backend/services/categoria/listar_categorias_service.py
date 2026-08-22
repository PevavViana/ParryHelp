from models import Categoria

class ListarCategoriasService:
    def executar(self):
        categorias = Categoria.listar_todos()
        return [categoria.to_dict() for categoria in categorias]