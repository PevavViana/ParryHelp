from models import Usuario

class DeletarUsuarioService:
    def executar(self, usuario_id):
        usuario = Usuario.buscar_por_id(usuario_id)
        if usuario is None:
            raise ValueError("Usuário não encontrado")
        usuario.deletar()