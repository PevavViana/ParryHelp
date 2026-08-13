from . import db
from .base import ModeloBase

class Categoria(ModeloBase):
    __tablename__ = "categorias"

    nome = db.Column(db.String(100), nullable=False)

    produtos = db.relationship("Produto", back_populates="categoria")

    def atualizar(self, nome=None):
        if nome is not None:
            self.nome = nome
        db.session.commit()

    def adicionar_produto(self, produto):
        if produto in self.produtos:
            return False
        self.produtos.append(produto)
        db.session.commit()
        return True

    def remover_produto(self, produto):
        if produto not in self.produtos:
            return False
        self.produtos.remove(produto)
        db.session.commit()
        return True

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
        }