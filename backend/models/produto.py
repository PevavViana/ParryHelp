from . import db
from .base import ModeloBase

class Produto(ModeloBase):
    __tablename__ = "produtos"

    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.String(120), nullable=False)

    categoria_id = db.Column(db.Integer, db.ForeignKey("categorias.id"), nullable=False)

    categoria = db.relationship("Categoria", back_populates="produtos")
    avaliacoes = db.relationship("Avaliacao", back_populates="produto")

    def atualizar(self, nome=None, descricao=None):
        if nome is not None:
            self.nome = nome
        if descricao is not None:
            self.descricao = descricao
        db.session.commit()

    def calcular_media(self):
        if not self.avaliacoes:
            return 0.0
        return sum(avaliacao.nota for avaliacao in self.avaliacoes) / len(self.avaliacoes)

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "descricao": self.descricao,
            "categoria_id": self.categoria_id,
            "media_notas": self.calcular_media(),
        }