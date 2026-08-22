from models import Avaliacao

class DeletarAvaliacaoService:
    def executar(self, avaliacao_id):
        avaliacao = Avaliacao.buscar_por_id(avaliacao_id)
        if avaliacao is None:
            raise ValueError("Avaliação não encontrada")
        avaliacao.deletar()