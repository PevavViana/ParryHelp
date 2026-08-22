from models import Avaliacao

class BuscarAvaliacaoService:
    def executar(self, avaliacao_id):
        avaliacao = Avaliacao.buscar_por_id(avaliacao_id)
        if avaliacao is None:
            raise ValueError("Avaliação não encontrada")
        return avaliacao.to_dict()