import os

import requests

class GeminiService:
    URL = "https://generativelanguage.googleapis.com/v1beta/interactions"

    def gerar_tutoria(self, prompt):
        chave = os.getenv("GEMINI_API_KEY")
        if not chave:
            raise RuntimeError("GEMINI_API_KEY não configurada.")

        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": chave,
        }
        body = {
            "model": os.getenv("GEMINI_MODEL", "gemini-3.6-flash"),
            "input": prompt,
        }

        try:
            resposta = requests.post(
                self.URL,
                headers=headers,
                json=body,
                timeout=30,
            )

            resposta.raise_for_status()
            dados = resposta.json()
            texto = dados.get("output_text")

            if not texto:
                for etapa in reversed(dados.get("steps", [])):
                    if etapa.get("type") != "model_output":
                        continue
                    partes = etapa.get("content", [])
                    texto = " ".join(
                        parte.get("text", "")
                        for parte in partes
                        if parte.get("type") == "text"
                    ).strip()
                    if texto:
                        break

            if not texto:
                raise RuntimeError("A IA retornou uma resposta vazia.")
            return texto

        except requests.Timeout as erro:
            raise RuntimeError("A IA demorou demais para responder.") from erro
        except requests.RequestException as erro:
            raise RuntimeError("Não foi possível acessar a IA.") from erro
