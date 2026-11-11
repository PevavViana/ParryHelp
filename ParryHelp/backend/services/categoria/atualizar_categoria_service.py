from models import Categoria

class AtualizarCategoriaService:
    def executar(self, id, dados):
        if not isinstance(dados, dict):
            raise ValueError("Envie os dados da categoria em formato JSON.")

        categoria = Categoria.buscar_por_id(id)

        if categoria is None:
            raise ValueError("Categoria não encontrada")

        nome = dados.get("nome")
        if not isinstance(nome, str) or not nome.strip() or len(nome.strip()) > 100:
            raise ValueError("Nome é obrigatório e deve ter no máximo 100 caracteres")

        categoria.atualizar(nome=nome.strip())
        return categoria.to_dict()
