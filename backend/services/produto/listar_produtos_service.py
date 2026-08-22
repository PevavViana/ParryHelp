from models import Produto

class ListarProdutosService:
    def executar(self):
        produtos = Produto.listar_todos()
        return [produto.to_dict() for produto in produtos]