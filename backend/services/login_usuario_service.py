from models import Usuario

class LoginUsuarioService:
    def executar(self, dados):
        email = dados.get("email")
        senha = dados.get("senha")

        usuario = Usuario.buscar_por_email(email)

        if usuario is None or usuario.senha != senha:
            raise ValueError("Usuario/Senha Invalida")

        return usuario.to_dict()