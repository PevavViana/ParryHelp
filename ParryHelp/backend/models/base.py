from datetime import datetime
from . import db

class ModeloBase(db.Model):
    __abstract__ = True

    id = db.Column(db.Integer, primary_key=True)
    data_criacao = db.Column(db.DateTime, default=datetime.now, nullable=False)
    data_atualizacao = db.Column(
        db.DateTime,
        default=datetime.now,
        onupdate=datetime.now,
        nullable=False,
    )

    def salvar(self):
        db.session.add(self)
        db.session.commit()

    def deletar(self):
        db.session.delete(self)
        db.session.commit()

    @classmethod
    def listar_todos(cls):
        return cls.query.order_by(cls.id.asc()).all()

    @classmethod
    def buscar_por_id(cls, id):
        return cls.query.get(id)