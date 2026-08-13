# AVISO: Precisa disso tudo?
from .criar_avaliacao_service import CriarAvaliacaoService
from .login_usuario_service import LoginUsuarioService
from .cadastrar_usuario_service import CadastrarUsuarioService
from .atualizar_usuario_service import AtualizarUsuarioService
from .atualizar_avaliacao_service import AtualizarAvaliacaoService
from .adicionar_produto_categoria_service import AdicionarProdutoCategoriaService
from .remover_produto_categoria_service import RemoverProdutoCategoriaService
from .atualizar_categoria_service import AtualizarCategoriaService
from .atualizar_produto_service import AtualizarProdutoService

__all__ = [
    "CriarAvaliacaoService",
    "LoginUsuarioService",
    "CadastrarUsuarioService",
    "AtualizarUsuarioService",
    "AtualizarAvaliacaoService",
    "AdicionarProdutoCategoriaService",
    "RemoverProdutoCategoriaService",
    "AtualizarCategoriaService",
    "AtualizarProdutoService",
]