from models import Avaliacao

class AtualizarAvaliacaoService:
    def executar(self, id, dados):
        avaliacao = Avaliacao.buscar_por_id(id)

        if avaliacao is None:
            raise ValueError("Avaliação não encontrada")

        avaliacao.atualizar(
            titulo=dados.get("titulo"),
            descricao=dados.get("descricao"),
            nota=dados.get("nota"),
            data=dados.get("data"),
        )

        return avaliacao.to_dict()