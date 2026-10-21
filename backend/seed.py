"""
Script de seed para popular o Taxatio com dados fictícios de teste.

Uso:
    python seed.py           # insere dados (não faz nada se o banco já tiver usuários)
    python seed.py --reset   # apaga tudo e recria do zero
"""

import random
import sys
from datetime import date, datetime, time, timedelta

from app import app
from models import db, Usuario, Categoria, Produto, Avaliacao

random.seed(42)  # remove se quiser dados diferentes a cada execução


def dias_atras(n):
    return date.today() - timedelta(days=n)


# ---------- USUÁRIOS ----------
USUARIOS = [
    ("Ana Beatriz Souza",     "ana.souza@email.com",     "senha123", "111.111.111-11"),
    ("Bruno Henrique Lima",   "bruno.lima@email.com",    "senha123", "222.222.222-22"),
    ("Carla Mendes Oliveira", "carla.mendes@email.com",  "senha123", "333.333.333-33"),
    ("Diego Ferreira Santos", "diego.santos@email.com",  "senha123", "444.444.444-44"),
    ("Elisa Costa Rocha",     "elisa.rocha@email.com",   "senha123", "555.555.555-55"),
    ("Felipe Araújo Nunes",   "felipe.nunes@email.com",  "senha123", "666.666.666-66"),
    ("Gabriela Martins Silva","gabi.silva@email.com",    "senha123", "777.777.777-77"),
    ("Henrique Ramos Alves",  "henrique.alves@email.com","senha123", "888.888.888-88"),
]

CATEGORIAS = [
    "Smartphones",
    "Notebooks",
    "Fones de Ouvido",
    "Smartwatches",
    "Tablets",
    "Consoles",
]

# (categoria, nome, descricao, qualidade_base, num_avaliacoes)
PRODUTOS = [
    ("Smartphones", "iPhone 15 Pro",           "Smartphone Apple com chip A17 Pro e câmera de 48MP", 9.0, 14),
    ("Smartphones", "Samsung Galaxy S24",      "Galaxy S24 com IA integrada e tela AMOLED 120Hz",   8.6, 12),
    ("Smartphones", "Xiaomi 14",               "Xiaomi 14 com câmera Leica e Snapdragon 8 Gen 3",   8.8,  9),
    ("Smartphones", "Motorola Edge 50",        "Edge 50 com tela pOLED curva e carga TurboPower",   7.4,  7),
    ("Smartphones", "Google Pixel 8",          "Pixel 8 com Android puro e câmera computacional",   8.5,  8),
    ("Notebooks",   "MacBook Air M3",          "Notebook Apple com chip M3 e 18h de bateria",       9.2, 11),
    ("Notebooks",   "Dell XPS 13",             "Ultrabook Dell com tela InfinityEdge e i7",         8.3,  8),
    ("Notebooks",   "Acer Aspire 5",           "Notebook custo-benefício para estudos e trabalho",  6.8, 10),
    ("Notebooks",   "Lenovo IdeaPad 3",        "IdeaPad 3 com Ryzen 5 e SSD de 512GB",              7.2,  9),
    ("Notebooks",   "Asus ROG Zephyrus G14",   "Gaming notebook com RTX 4060 e tela 120Hz",         8.9,  6),
    ("Fones de Ouvido", "AirPods Pro 2",       "Fone TWS Apple com cancelamento ativo de ruído",    9.1, 12),
    ("Fones de Ouvido", "Sony WH-1000XM5",     "Headphone over-ear com ANC líder de mercado",       9.3, 10),
    ("Fones de Ouvido", "JBL Tune 520BT",      "Fone bluetooth on-ear com 57h de bateria",          7.0,  8),
    ("Fones de Ouvido", "Galaxy Buds 3",       "Fone TWS Samsung com áudio 24 bits",                7.8,  7),
    ("Fones de Ouvido", "Edifier W820NB",      "Headphone com ANC e preço acessível",               7.6,  6),
    ("Smartwatches", "Apple Watch Series 9",   "Smartwatch Apple com tela always-on e ECG",         8.9, 10),
    ("Smartwatches", "Galaxy Watch 6",         "Relógio Samsung com Wear OS e monitor cardíaco",    8.2,  8),
    ("Smartwatches", "Amazfit GTR 4",          "Smartwatch com GPS duplo e 14 dias de bateria",     7.9,  7),
    ("Smartwatches", "Xiaomi Smart Band 8",    "Pulseira inteligente com 16 dias de bateria",       6.5,  9),
    ("Tablets", "iPad Air 5",                  "Tablet Apple com chip M1 e tela Liquid Retina",     9.0,  9),
    ("Tablets", "Galaxy Tab S9",               "Tablet Samsung AMOLED com S Pen incluso",           8.7,  7),
    ("Tablets", "Xiaomi Pad 6",                "Tablet com tela 144Hz e Snapdragon 870",            8.0,  6),
    ("Tablets", "Lenovo Tab P11",              "Tablet intermediário com boa autonomia",            6.9,  5),
    ("Consoles", "PlayStation 5 Slim",         "Console Sony com SSD ultrarrápido e ray tracing",   9.1, 13),
    ("Consoles", "Xbox Series X",              "Console Microsoft com 12 TFLOPS e Quick Resume",    8.6, 10),
    ("Consoles", "Nintendo Switch OLED",       "Console híbrido com tela OLED vibrante",            8.4,  9),
    ("Consoles", "Steam Deck OLED",            "PC portátil com tela HDR e SteamOS",                8.8,  7),
]

# Templates por categoria e sentimento (nota define qual pool usar)
TEMPLATES = {
    "Smartphones": {
        "positivo": [
            ("Câmera impressionante", "As fotos noturnas ficaram absurdas, superou tudo que eu tinha antes."),
            ("Rápido e fluido", "Zero travamentos, abre tudo na hora. Muito bom mesmo."),
            ("Bateria boa", "Aguenta o dia inteiro com uso pesado, sem sufoco."),
            ("Valeu o investimento", "Melhor celular que já tive até hoje, sem arrependimento."),
        ],
        "neutro": [
            ("Bom, mas caro", "Excelente aparelho, porém o preço no Brasil ainda é salgado."),
            ("Cumpre o que promete", "Não é revolucionário, mas faz tudo o que eu esperava."),
            ("Evolução discreta", "Pouca diferença em relação ao modelo anterior, mas funciona bem."),
        ],
        "negativo": [
            ("Esquenta demais", "Em jogos mais pesados fica muito quente na mão."),
            ("Bateria decepcionante", "Não chega ao fim do dia se eu usar bastante."),
            ("Caro pelo que entrega", "Não vale o preço cobrado pela versão de entrada."),
        ],
    },
    "Notebooks": {
        "positivo": [
            ("Bateria absurda", "Aguenta um dia inteiro de trabalho longe da tomada."),
            ("Leve e silencioso", "Nem parece que está ligado, super discreto."),
            ("Tela linda", "Cores vibrantes, ótimo para editar fotos."),
            ("Performance top", "Roda tudo que preciso sem engasgar."),
        ],
        "neutro": [
            ("Bom para o dia a dia", "Faz o básico muito bem, mas não espere mais que isso."),
            ("Custo-benefício ok", "Pelo preço, atende. Tem concorrentes melhores no mesmo valor."),
            ("Cumpre a função", "Para estudar e trabalhar, serve bem. Nada além disso."),
        ],
        "negativo": [
            ("Esquenta muito", "As ventoinhas fazem barulho e o teclado fica quente."),
            ("Tela fraca", "As cores são lavadas e o brilho é baixo para ambientes claros."),
            ("Acabamento simples", "Plástico frágil, não parece durar muito tempo."),
        ],
    },
    "Fones de Ouvido": {
        "positivo": [
            ("ANC excelente", "Corta o ruído do metrô quase que por completo."),
            ("Som de altíssima qualidade", "Graves, médios e agudos muito equilibrados."),
            ("Confortável", "Uso por horas sem sentir incômodo algum."),
            ("Bateria surpreendente", "Passo dias sem precisar recarregar."),
        ],
        "neutro": [
            ("Bom pelo preço", "Entrega o esperado, mas não tem nada de extraordinário."),
            ("Cumpre o básico", "Para chamadas e música casual, funciona bem."),
            ("Ok, sem mais", "Som razoável, mas o ANC deixa a desejar."),
        ],
        "negativo": [
            ("Conexão falha", "Perde o pareamento com frequência no celular."),
            ("Desconfortável", "Depois de 1 hora dói a orelha."),
            ("Grave distorcido", "Em volume alto a distorção é bem audível."),
        ],
    },
    "Smartwatches": {
        "positivo": [
            ("Notificações no pulso", "Não preciso pegar o celular toda hora."),
            ("Monitor cardíaco confiável", "Bate com o valor do meu aparelho de pressão."),
            ("Bateria ótima", "Carrego uma vez por semana, ótimo."),
            ("Design bonito", "Chama atenção em qualquer lugar."),
        ],
        "neutro": [
            ("Útil para exercícios", "Faz o que promete, mas o app poderia ser melhor."),
            ("Ok para o preço", "Não tem tudo que os topos têm, mas atende."),
            ("Simples e funcional", "Não é o mais bonito, mas funciona bem."),
        ],
        "negativo": [
            ("Bateria fraca", "Tenho que carregar todo dia, muito chato."),
            ("App bugado", "O app desconecta do relógio com frequência."),
            ("Medição imprecisa", "Os passos e o sono são bem imprecisos."),
        ],
    },
    "Tablets": {
        "positivo": [
            ("Tela maravilhosa", "Ótima para assistir séries e ler."),
            ("Leve e portátil", "Levo na mochila sem esforço."),
            ("Bateria durável", "Passo o dia estudando e ainda sobra."),
            ("Performance ótima", "Roda tudo sem travar."),
        ],
        "neutro": [
            ("Bom para consumo", "Assistir vídeo e ler é o forte, não espere mais."),
            ("Atende o esperado", "Não é um substituto de notebook, mas quebra o galho."),
            ("Intermediário", "Pelo preço, cumpre. Poderia ser mais rápido."),
        ],
        "negativo": [
            ("Lento", "Abre apps com lentidão, trava direto."),
            ("Tela mediana", "Cores fracas e reflexo atrapalha."),
            ("Acessórios caros", "Teclado e caneta custam quase o valor do tablet."),
        ],
    },
    "Consoles": {
        "positivo": [
            ("Jogos incríveis", "Biblioteca enorme de exclusivos valiosos."),
            ("Carregamento rápido", "SSD faz diferença absurda."),
            ("Gráficos de outro nível", "4K com ray tracing fica lindo."),
            ("Silencioso", "Nem parece que está ligado."),
        ],
        "neutro": [
            ("Bom, mas caro", "Os jogos custam muito caro no Brasil."),
            ("Vale se você tem tempo", "Sem tempo para jogar, fica parado."),
            ("Cumpre o prometido", "Não tem nada de inovador, mas diverte."),
        ],
        "negativo": [
            ("Superaquecimento", "Depois de horas jogando, aquece demais."),
            ("Armazenamento pequeno", "Instala 3 jogos e já enche o SSD."),
            ("Jogos caríssimos", "Um jogo custa quase o valor do console em promoção."),
        ],
    },
}


def sortear_nota(base):
    nota = random.gauss(base, 1.3)
    return round(max(0.0, min(10.0, nota)), 1)


def escolher_template(categoria, nota):
    if nota >= 7.5:
        sentimento = "positivo"
    elif nota >= 5.0:
        sentimento = "neutro"
    else:
        sentimento = "negativo"
    return random.choice(TEMPLATES[categoria][sentimento])


def popular(reset=False):
    with app.app_context():
        db.create_all()

        if reset:
            print("Apagando dados antigos...")
            Avaliacao.query.delete()
            Produto.query.delete()
            Categoria.query.delete()
            Usuario.query.delete()
            db.session.commit()

        if Usuario.query.count() > 0:
            print(f"Já existem {Usuario.query.count()} usuários. Use --reset para recriar.")
            return

        # Usuários
        usuarios = [Usuario(nome=n, email=e, senha=s, cpf=c) for n, e, s, c in USUARIOS]
        db.session.add_all(usuarios)
        db.session.commit()
        print(f"{len(usuarios)} usuários criados.")

        # Categorias
        categorias = {nome: Categoria(nome=nome) for nome in CATEGORIAS}
        db.session.add_all(categorias.values())
        db.session.commit()
        print(f"{len(categorias)} categorias criadas.")

        # Produtos
        produtos = []
        for cat_nome, nome, desc, base, qtd in PRODUTOS:
            p = Produto(nome=nome, descricao=desc, categoria_id=categorias[cat_nome].id)
            db.session.add(p)
            produtos.append((p, cat_nome, base, qtd))
        db.session.commit()
        print(f"{len(produtos)} produtos criados.")

        # Avaliações (espalhadas em até 365 dias)
        total = 0
        for produto, cat_nome, base, qtd in produtos:
            for _ in range(qtd):
                usuario = random.choice(usuarios)
                dias = random.randint(0, 365)
                data_review = dias_atras(dias)
                hora = time(hour=random.randint(8, 22), minute=random.randint(0, 59))
                nota = sortear_nota(base)
                titulo, descricao = escolher_template(cat_nome, nota)

                avaliacao = Avaliacao(
                    titulo=titulo,
                    descricao=descricao,
                    nota=nota,
                    data=data_review,
                    usuario_id=usuario.id,
                    produto_id=produto.id,
                    data_criacao=datetime.combine(data_review, hora),
                    data_atualizacao=datetime.combine(data_review, hora),
                )
                db.session.add(avaliacao)
                total += 1

        db.session.commit()
        print(f"{total} avaliações criadas.")


if __name__ == "__main__":
    popular(reset="--reset" in sys.argv)
    print("\nPronto!")
    print("Login de teste: ana.souza@email.com  /  senha123")