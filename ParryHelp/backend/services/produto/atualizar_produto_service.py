from models import Produto, Categoria


class AtualizarProdutoService:
    def executar(self, id, dados):
        if not isinstance(dados, dict):
            raise ValueError("Envie os dados do produto em formato JSON.")

        produto = Produto.buscar_por_id(id)

        if produto is None:
            raise ValueError("Produto não encontrado")

        nome = dados.get("nome")
        descricao = dados.get("descricao")
        imagem_url = dados.get("imagem_url")
        categoria_id = dados.get("categoria_id")

        if "nome" in dados:
            if (
                not isinstance(nome, str)
                or not nome.strip()
                or len(nome.strip()) > 100
            ):
                raise ValueError("Nome é obrigatório e deve ter no máximo 100 caracteres")
            nome = nome.strip()

        if "descricao" in dados:
            if (
                not isinstance(descricao, str)
                or not descricao.strip()
                or len(descricao.strip()) > 120
            ):
                raise ValueError("Descrição é obrigatória e deve ter no máximo 120 caracteres")
            descricao = descricao.strip()

        if "imagem_url" in dados:
            if imagem_url is not None and not isinstance(imagem_url, str):
                raise ValueError("A imagem deve ser informada como texto")
            if imagem_url and len(imagem_url) > 500:
                raise ValueError("A imagem deve ter no máximo 500 caracteres")
            imagem_url = imagem_url.strip() if imagem_url is not None else ""
        else:
            imagem_url = None

        if "categoria_id" in dados:
            if (
                isinstance(categoria_id, bool)
                or not isinstance(categoria_id, int)
                or categoria_id < 1
            ):
                raise ValueError("Categoria é obrigatória")
            if Categoria.buscar_por_id(categoria_id) is None:
                raise ValueError("Categoria não encontrada")

        produto.atualizar(
            nome=nome,
            descricao=descricao,
            imagem_url=imagem_url,
            categoria_id=categoria_id,
        )
        return produto.to_dict()
