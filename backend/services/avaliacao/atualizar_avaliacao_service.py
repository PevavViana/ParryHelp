from datetime import datetime
from math import isfinite

from models import Avaliacao


class AtualizarAvaliacaoService:
    def executar(self, id, dados):
        if not isinstance(dados, dict):
            raise ValueError("Envie os dados da avaliação em formato JSON.")

        avaliacao = Avaliacao.buscar_por_id(id)

        if avaliacao is None:
            raise ValueError("Avaliação não encontrada")

        titulo = dados.get("titulo")
        descricao = dados.get("descricao")
        nota = dados.get("nota")

        if "titulo" in dados:
            if (
                not isinstance(titulo, str)
                or not titulo.strip()
                or len(titulo.strip()) > 100
            ):
                raise ValueError("Título é obrigatório e deve ter no máximo 100 caracteres")
            titulo = titulo.strip()

        if "descricao" in dados:
            if (
                not isinstance(descricao, str)
                or not descricao.strip()
                or len(descricao.strip()) > 120
            ):
                raise ValueError("Descrição é obrigatória e deve ter no máximo 120 caracteres")
            descricao = descricao.strip()

        if "nota" in dados:
            if isinstance(nota, bool):
                raise ValueError("Nota deve ser um número entre 0 e 10")
            try:
                nota = float(nota)
            except (TypeError, ValueError):
                raise ValueError("Nota deve ser um número entre 0 e 10") from None

            if not isfinite(nota) or nota < 0 or nota > 10:
                raise ValueError("Nota deve ser um número entre 0 e 10")

        if "data" in dados and dados["data"] is not None:
            data_enviada = None
            for formato in ("%d-%m-%Y", "%Y-%m-%d"):
                try:
                    data_enviada = datetime.strptime(dados["data"], formato).date()
                    break
                except (TypeError, ValueError):
                    continue

            if data_enviada is None:
                raise ValueError("Data deve estar no formato DD-MM-AAAA")
            if data_enviada != avaliacao.data:
                raise ValueError("A data original da avaliação não pode ser alterada.")

        avaliacao.atualizar(
            titulo=titulo,
            descricao=descricao,
            nota=nota,
        )

        return avaliacao.to_dict()
