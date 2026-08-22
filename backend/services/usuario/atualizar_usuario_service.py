from models import Usuario

class AtualizarUsuarioService:
    def executar(self, id, dados):
        usuario = Usuario.buscar_por_id(id)

        if usuario is None:
            raise ValueError("Usuário não encontrado")

        usuario.atualizar(
            nome=dados.get("nome"),
            email=dados.get("email"),
            senha=dados.get("senha"),
            cpf=dados.get("cpf"),
        )

        return usuario.to_dict()