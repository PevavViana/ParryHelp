from models import Usuario

class CadastrarUsuarioService:
    def executar(self, dados):
        nome = dados.get("nome")
        email = dados.get("email")
        senha = dados.get("senha")
        cpf = dados.get("cpf")

        if Usuario.buscar_por_email(email) is not None:
            raise ValueError("E-mail já cadastrado")

        usuario = Usuario(nome=nome, email=email, senha=senha, cpf=cpf)
        usuario.salvar()
        
        return usuario.to_dict()