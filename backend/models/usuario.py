from . import db
from .base import ModeloBase

class Usuario(ModeloBase):
    __tablename__ = "usuarios"

    nome       = db.Column(db.String(100), nullable=False                )
    email      = db.Column(db.String(120), unique=True,    nullable=False)
    senha      = db.Column(db.String(255), nullable=False                ) 
    cpf        = db.Column(db.String(14),  unique=True,    nullable=False)

    avaliacoes = db.relationship("Avaliacao", back_populates="usuario", cascade="all, delete-orphan")
    
    def atualizar(self, nome=None, email=None, senha=None, cpf=None):
        if nome is not None: 
            self.nome = nome
        if email is not None: 
            self.email = email
        if senha is not None: 
            self.senha = senha
        if cpf is not None: 
            self.cpf = cpf

        db.session.commit()
    
    @staticmethod
    def buscar_por_email(email):
        return Usuario.query.filter_by(email=email).first()

    def to_dict(self):
        return {
            "id": self.id,
            "nome": self.nome,
            "email": self.email,
            "cpf": self.cpf,
        }