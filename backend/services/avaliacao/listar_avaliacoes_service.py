from models import Avaliacao

class ListarAvaliacoesService:
    def executar(self):
        avaliacoes = Avaliacao.listar_todos()
        return [avaliacao.to_dict() for avaliacao in avaliacoes]