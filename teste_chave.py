import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

chave = os.getenv("GEMINI_API_KEY")
print(f"🔑 Testando chave: {chave[:5]}...{chave[-5:] if chave else 'None'}")

if not chave:
    print("❌ Erro: Chave não encontrada no .env")
    exit()

try:
    genai.configure(api_key=chave)
    model = genai.GenerativeModel('gemini-flash-latest')
    response = model.generate_content("Diga 'Olá' se estiver funcionando.")
    print(f"✅ Sucesso! Resposta da IA: {response.text}")
except Exception as e:
    print(f"❌ Falha de Permissão: {e}")