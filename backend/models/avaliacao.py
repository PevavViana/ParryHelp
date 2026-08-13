from . import db
from .base import ModeloBase
from .usuario import Usuario

class Avaliacao(ModeloBase):
    __tablename__ = "avaliacoes"

    titulo     = db.Column(db.String(100), nullable=False)
    descricao  = db.Column(db.String(120), nullable=False)
    nota       = db.Column(db.Float,       nullable=False) 
    data       = db.Column(db.Date,        nullable=False)

    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    produto_id = db.Column(db.Integer, db.ForeignKey("produtos.id"), nullable=False)

    usuario = db.relationship("Usuario", back_populates="avaliacoes")
    produto = db.relationship("Produto", back_populates="avaliacoes")

    def atualizar(self, titulo=None, descricao=None, nota=None, data=None):
        if titulo is not None: 
            self.titulo = titulo
        if descricao is not None: 
            self.descricao = descricao
        if nota is not None: 
            self.nota = nota
        if data is not None: 
            self.data = data

        db.session.commit()
    
    def to_dict(self):
        return {
            "id": self.id,
            "titulo": self.titulo,
            "descricao": self.descricao,
            "nota": self.nota,
            "data": self.data.isoformat(),
            "usuario_id": self.usuario_id,
            "produto_id": self.produto_id,
        }