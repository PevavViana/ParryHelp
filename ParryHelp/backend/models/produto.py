from . import db
from .base import ModeloBase

class Produto(ModeloBase):
    __tablename__ = "produtos"

    nome = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.String(120), nullable=False)
    imagem_url = db.Column(db.String(500), nullable=True)  

    categoria_id = db.Column(db.Integer, db.ForeignKey("categorias.id"), nullable=False)

    categoria = db.relationship("Categoria",  back_populates="produtos")
    avaliacoes = db.relationship("Avaliacao", back_populates="produto", cascade="all, delete-orphan")

    def atualizar(self, nome=None, descricao=None, imagem_url=None, categoria_id=None):
        if nome is not None:
            self.nome = nome
        if descricao is not None:
            self.descricao = descricao
        if imagem_url is not None:
            self.imagem_url = imagem_url
        if categoria_id is not None:
            self.categoria_id = categoria_id
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
            "imagem_url": self.imagem_url,  
        }
