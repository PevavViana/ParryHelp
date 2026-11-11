from flask_sqlalchemy import SQLAlchemy
db = SQLAlchemy()

from .base import ModeloBase
from .usuario import Usuario
from .avaliacao import Avaliacao
from .produto import Produto
from .categoria import Categoria
from .termo_aceite import TermoAceite

__all__ = ["db", "ModeloBase", "Usuario", "Avaliacao", "Produto", "Categoria", "TermoAceite"]
