from datetime import datetime

from models import Avaliacao

class AtualizarAvaliacaoService:
    def executar(self, id, dados):
        avaliacao = Avaliacao.buscar_por_id(id)

        if avaliacao is None:
            raise ValueError("Avaliação não encontrada")

        data = None
        if dados.get("data") is not None:
            data = datetime.strptime(dados["data"], "%d-%m-%Y").date()

        avaliacao.atualizar(
            titulo=dados.get("titulo"),
            descricao=dados.get("descricao"),
            nota=dados.get("nota"),
            data=data,
        )

        return avaliacao.to_dict()