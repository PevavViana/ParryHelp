from datetime import datetime
from math import isfinite
from zoneinfo import ZoneInfo

from models import Usuario, Produto, Avaliacao


class CriarAvaliacaoService:
    def executar(self, usuario_id, dados):
        if not isinstance(dados, dict):
            raise ValueError("Envie os dados da avaliação em formato JSON.")

        titulo = dados.get("titulo")
        descricao = dados.get("descricao")
        nota = dados.get("nota")

        if (
            not isinstance(titulo, str)
            or not titulo.strip()
            or len(titulo.strip()) > 100
        ):
            raise ValueError("Título é obrigatório e deve ter no máximo 100 caracteres")

        if (
            not isinstance(descricao, str)
            or not descricao.strip()
            or len(descricao.strip()) > 120
        ):
            raise ValueError("Descrição é obrigatória e deve ter no máximo 120 caracteres")

        if isinstance(nota, bool):
            raise ValueError("Nota deve ser um número entre 0 e 10")
        try:
            nota = float(nota)
        except (TypeError, ValueError):
            raise ValueError("Nota deve ser um número entre 0 e 10") from None

        if not isfinite(nota) or nota < 0 or nota > 10:
            raise ValueError("Nota deve ser um número entre 0 e 10")

        data = datetime.now(ZoneInfo("America/Sao_Paulo")).date()
        if dados.get("data") is not None:
            data_enviada = None
            for formato in ("%d-%m-%Y", "%Y-%m-%d"):
                try:
                    data_enviada = datetime.strptime(dados["data"], formato).date()
                    break
                except (TypeError, ValueError):
                    continue

            if data_enviada is None:
                raise ValueError("Data deve estar no formato DD-MM-AAAA")
            if data_enviada != data:
                raise ValueError("A avaliação deve ser registrada com a data de hoje.")

        usuario = Usuario.buscar_por_id(usuario_id)

        if usuario is None:
            raise ValueError("Usuário não encontrado")

        produto = Produto.buscar_por_id(dados.get("produto_id"))
        if produto is None:
            raise ValueError("Produto não encontrado")

        avaliacao = Avaliacao(
            titulo=titulo.strip(),
            descricao=descricao.strip(),
            nota=nota,
            data=data,
            usuario=usuario,
            produto=produto,
        )
        
        avaliacao.salvar()
        return avaliacao.to_dict()
