from models import Usuario
from repositories import AvaliacaoRepository

class HistoricoAvaliacoesUsuarioService:
    def executar(self, usuario_id):
        if Usuario.buscar_por_id(usuario_id) is None:
            raise ValueError("Usuário não encontrado")

        return AvaliacaoRepository.historico_por_usuario(usuario_id)