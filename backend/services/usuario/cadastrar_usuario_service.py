from models import TermoAceite, Usuario

class CadastrarUsuarioService:
    def executar(self, dados):
        nome = dados.get("nome")
        email = dados.get("email")
        senha = dados.get("senha")
        cpf = dados.get("cpf")

        if dados.get("aceita_termos") is not True:
            raise ValueError("É necessário aceitar os Termos de Uso para criar a conta")

        if dados.get("consentiu_dados") is not True:
            raise ValueError("É necessário consentir com o tratamento de dados para criar a conta")


        if not nome or len(nome) > 40:
            raise ValueError("Nome é obrigatório e deve ter no máximo 150 caracteres")

        if Usuario.buscar_por_email(email) is not None:
            raise ValueError("E-mail já cadastrado")

        usuario = Usuario(nome=nome, email=email, senha=senha, cpf=cpf)
        usuario.termos_aceitos.extend([
            TermoAceite(documento="termos_uso", versao="2026.1"),
            TermoAceite(documento="consentimento_dados", versao="2026.1"),
        ])
        usuario.salvar()
        
        return usuario.to_dict()
