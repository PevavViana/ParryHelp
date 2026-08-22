from models import Categoria

class AtualizarCategoriaService:
    def executar(self, id, dados):
        categoria = Categoria.buscar_por_id(id)

        if categoria is None:
            raise ValueError("Categoria não encontrada")

        categoria.atualizar(nome=dados.get("nome"))
        return categoria.to_dict()