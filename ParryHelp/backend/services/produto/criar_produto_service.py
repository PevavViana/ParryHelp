from models import Produto, Categoria

class CriarProdutoService:
    def executar(self, dados):
        if not isinstance(dados, dict):
            raise ValueError("Envie os dados do produto em formato JSON.")

        nome = dados.get("nome")
        descricao = dados.get("descricao")
        categoria_id = dados.get("categoria_id")

        if not isinstance(nome, str) or not nome.strip() or len(nome.strip()) > 100:
            raise ValueError("Nome é obrigatório e deve ter no máximo 100 caracteres")

        if not isinstance(descricao, str) or not descricao.strip() or len(descricao.strip()) > 120:
            raise ValueError("Descrição é obrigatória e deve ter no máximo 120 caracteres")

        if isinstance(categoria_id, bool) or not isinstance(categoria_id, int) or categoria_id < 1:
            raise ValueError("Categoria é obrigatória")

        if Categoria.buscar_por_id(categoria_id) is None:
            raise ValueError("Categoria não encontrada")

        imagem_url = dados.get("imagem_url")
        if imagem_url is not None and not isinstance(imagem_url, str):
            raise ValueError("A imagem deve ser informada como texto")
        if imagem_url and len(imagem_url) > 500:
            raise ValueError("A imagem deve ter no máximo 500 caracteres")

        produto = Produto(
            nome=nome.strip(),
            descricao=descricao.strip(),
            categoria_id=categoria_id,
            imagem_url=imagem_url or None,
        )
        
        produto.salvar()
        return produto.to_dict()
