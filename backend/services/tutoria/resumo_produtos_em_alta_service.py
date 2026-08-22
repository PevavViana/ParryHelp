import json

from repositories import ProdutoRepository
from .gemini_service import GeminiService


class ResumoProdutosEmAltaService:
    def executar(self, limite=5):
        produtos = ProdutoRepository.produtos_em_alta(limite)

        if not produtos:
            raise ValueError("Não existem produtos avaliados para resumir.")

        prompt = f"""Você é um tutor de compras de tecnologia.
        Analise os produtos avaliados pela comunidade abaixo e produza um resumo curto,
        objetivo e adequado para a página de avaliações.
        Produtos:
        {json.dumps(produtos, ensure_ascii=False, default=str)}
        Responda com:
        1. uma síntese dos produtos em alta;
        2. os produtos que mais se destacam e o motivo;
        3. um cuidado importante para o comprador.
        Não invente informações que não estejam nos dados."""

        resumo = GeminiService().gerar_tutoria(prompt)
        return {
            "tipo": "produtos_em_alta",
            "resumo": resumo,
            "produtos": produtos,
        }
