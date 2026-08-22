from datetime import datetime
from models import Usuario, Produto, Avaliacao

class CriarAvaliacaoService:
    def executar(self, usuario_id, dados):
        usuario = Usuario.buscar_por_id(usuario_id)

        if usuario is None:
            raise ValueError("Usuário não encontrado")

        produto = Produto.buscar_por_id(dados.get("produto_id"))
        if produto is None:
            raise ValueError("Produto não encontrado")

        data_str = dados.get("data")
        if not data_str:
            raise ValueError("Data é obrigatoria")

        data = datetime.strptime(data_str, "%d-%m-%Y").date()

        avaliacao = Avaliacao(
            titulo=dados.get("titulo"),
            descricao=dados.get("descricao"),
            nota=dados.get("nota"),
            data=data,
            usuario=usuario,
            produto=produto,
        )
        
        avaliacao.salvar()
        return avaliacao.to_dict()