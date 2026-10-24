from . import db
from .base import ModeloBase


class TermoAceite(ModeloBase):
    __tablename__ = "termos_aceitos"
    __table_args__ = (
        db.UniqueConstraint(
            "usuario_id",
            "documento",
            "versao",
            name="uq_termo_aceito_usuario_documento_versao",
        ),
    )

    usuario_id = db.Column(db.Integer, db.ForeignKey("usuarios.id"), nullable=False)
    documento = db.Column(db.String(40), nullable=False)
    versao = db.Column(db.String(20), nullable=False)

    usuario = db.relationship("Usuario", back_populates="termos_aceitos")
