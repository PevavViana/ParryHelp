from models import Categoria

class CriarCategoriaService:
    def executar(self, dados):
        if not isinstance(dados, dict):
            raise ValueError("Envie os dados da categoria em formato JSON.")

        nome = dados.get("nome")
        if not isinstance(nome, str) or not nome.strip() or len(nome.strip()) > 100:
            raise ValueError("Nome é obrigatório e deve ter no máximo 100 caracteres")

        categoria = Categoria(nome=nome.strip())
        categoria.salvar()
        return categoria.to_dict()
