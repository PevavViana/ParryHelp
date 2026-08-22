from repositories import ProdutoRepository

class ProdutosMaisAvaliadosService:
    def executar(self, limite=5):
        return ProdutoRepository.produtos_mais_avaliados(limite)