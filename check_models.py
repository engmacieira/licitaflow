import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("🔍 Listando modelos disponíveis para sua chave...")

try:
    for m in genai.list_models():
        # Filtra apenas modelos que geram texto (generateContent)
        if 'generateContent' in m.supported_generation_methods:
            print(f"- {m.name}")
except Exception as e:
    print(f"❌ Erro ao listar modelos: {e}")