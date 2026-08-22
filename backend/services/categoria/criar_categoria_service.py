from models import Categoria

class CriarCategoriaService:
    def executar(self, dados):
        nome = dados.get("nome")
        if not nome:
            raise ValueError("Nome é obrigatório")

        categoria = Categoria(nome=nome)
        categoria.salvar()
        return categoria.to_dict()