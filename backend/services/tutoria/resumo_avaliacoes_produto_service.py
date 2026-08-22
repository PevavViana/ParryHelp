import json

from models import Produto
from repositories import AvaliacaoRepository
from .gemini_service import GeminiService

class ResumoAvaliacoesProdutoService:
    def executar(self, produto_id, limite=10):
        produto = Produto.buscar_por_id(produto_id)
        if produto is None:
            raise ValueError("Produto não encontrado.")

        avaliacoes = AvaliacaoRepository.por_produto(produto_id, limite)
        if not avaliacoes:
            raise ValueError("Este produto ainda não possui avaliações.")

        prompt = f"""Você é um tutor de compras de tecnologia.
        Analise as avaliações reais do produto abaixo e gere um resumo para quem está
        decidindo se deve comprá-lo.
        
        Produto: {produto.nome}
        Descrição: {produto.descricao}
        Avaliações:
        {json.dumps(avaliacoes, ensure_ascii=False, default=str)}
        
        Responda com:
        1. síntese geral das opiniões;
        2. pontos positivos mais citados;
        3. pontos negativos mais citados;
        4. recomendação objetiva baseada somente nas avaliações.
        Não invente informações e não atribua uma nota diferente da base."""
        
        resumo = GeminiService().gerar_tutoria(prompt)
        return {
            "tipo": "avaliacoes_relevantes",
            "produto_id": produto_id,
            "produto": produto.nome,
            "resumo": resumo,
            "avaliacoes": avaliacoes,
        }
