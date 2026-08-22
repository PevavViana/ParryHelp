# Essa quantidade de services é normal mesmo???

from .avaliacao.criar_avaliacao_service import CriarAvaliacaoService
from .avaliacao.atualizar_avaliacao_service import AtualizarAvaliacaoService
from .avaliacao.listar_avaliacoes_service import ListarAvaliacoesService
from .avaliacao.buscar_avaliacao_service import BuscarAvaliacaoService
from .avaliacao.deletar_avaliacao_service import DeletarAvaliacaoService
from .avaliacao.historico_avaliacoes_usuario_service import HistoricoAvaliacoesUsuarioService

from .usuario.login_usuario_service import LoginUsuarioService
from .usuario.cadastrar_usuario_service import CadastrarUsuarioService
from .usuario.atualizar_usuario_service import AtualizarUsuarioService
from .usuario.listar_usuarios_service import ListarUsuariosService
from .usuario.buscar_usuario_service import BuscarUsuarioService
from .usuario.deletar_usuario_service import DeletarUsuarioService

from .produto.criar_produto_service import CriarProdutoService
from .produto.atualizar_produto_service import AtualizarProdutoService
from .produto.listar_produtos_service import ListarProdutosService
from .produto.buscar_produto_service import BuscarProdutoService
from .produto.deletar_produto_service import DeletarProdutoService
from .produto.adicionar_produto_categoria_service import AdicionarProdutoCategoriaService
from .produto.remover_produto_categoria_service import RemoverProdutoCategoriaService
from .produto.produtos_mais_avaliados_service import ProdutosMaisAvaliadosService
from .produto.produtos_por_categoria_service import ProdutosPorCategoriaService

from .categoria.criar_categoria_service import CriarCategoriaService
from .categoria.atualizar_categoria_service import AtualizarCategoriaService
from .categoria.listar_categorias_service import ListarCategoriasService
from .categoria.buscar_categoria_service import BuscarCategoriaService
from .categoria.deletar_categoria_service import DeletarCategoriaService
from .tutoria import (
    GeminiService,
    ResumoProdutosEmAltaService,
    ResumoAvaliacoesProdutoService,
)

__all__ = [
    "CriarAvaliacaoService", "AtualizarAvaliacaoService", "ListarAvaliacoesService",
    "BuscarAvaliacaoService", "DeletarAvaliacaoService", "HistoricoAvaliacoesUsuarioService",
    "LoginUsuarioService", "CadastrarUsuarioService", "AtualizarUsuarioService",
    "ListarUsuariosService", "BuscarUsuarioService", "DeletarUsuarioService",
    "CriarProdutoService", "AtualizarProdutoService", "ListarProdutosService",
    "BuscarProdutoService", "DeletarProdutoService",
    "AdicionarProdutoCategoriaService", "RemoverProdutoCategoriaService",
    "ProdutosMaisAvaliadosService", "ProdutosPorCategoriaService",
    "CriarCategoriaService", "AtualizarCategoriaService", "ListarCategoriasService",
    "BuscarCategoriaService", "DeletarCategoriaService",
    "GeminiService", "ResumoProdutosEmAltaService",
    "ResumoAvaliacoesProdutoService",
]