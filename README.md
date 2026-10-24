# Taxatio
Projeto de avaliações de produtos de tecnologia, com frontend web e API Flask

## Estrutura
```text
backend/
├── controllers/
├── database/
├── models/
├── repositories/
├── services/
├── app.py
└── requirements.txt

frontend/
├── assets/
├── css/
├── js/
├── index.html
├── catalogo.html
├── produto.html
├── comparar.html
├── conta.html
└── gerenciar.html
```

## Funcionalidades Implementadas
1. Cadastro de usuário
2. Login
3. Consultar diversos dados relevantes da própria conta
4. Atualizar os dados da conta
5. Excluir a conta e suas avaliações
6. Listar produtos do catálogo
7. Consultar os detalhes de um produto
8. Listar categorias
9. Consultar as avaliações de um produto
10. Publicar uma avaliação
11. Editar uma avaliação
12. Excluir uma avaliação
13. Consultar o histórico de avaliações do usuário
14. Cadastrar produto
15. Atualizar produto, incluindo sua categoria
16. Excluir produto e suas avaliações
17. Cadastrar categoria
18. Atualizar categoria
19. Excluir categoria sem produtos associados
20. Gerar resumo por IA das avaliações de um produto

## Arquitetura 
Controllers com classes baseadas em `MethodView`, separadas por recurso. Cada ação chama seu Service mas mantendo az regras de validação que permanecem nos Services, a persistência CRUD fica nas Models e consultas especiais ficam nos Repositories. A integração com o Gemini está encapsulada em um Service.

## Configuração local
1. Instalar as dependências em `backend/requirements.txt`
2. Inicie um servidor MySQL/MariaDB e crie o banco e as procedures na raiz do projeto
3. Configure `DATABASE_URL` em `backend/.env` com o usuário, a senha e o banco `parryhelp_db`, seguindo o formato do `.env.example`. Configurar também `GEMINI_API_KEY` para os recursosde AI
4. Inicie a API a partir de `backend/` com `python app.py`
5. Abra `frontend/index.html`