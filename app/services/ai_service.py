import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold
import os
from dotenv import load_dotenv

load_dotenv()

class AIService:
    def __init__(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("A variável GEMINI_API_KEY não está configurada.")
        
        genai.configure(api_key=api_key)
        
        # MUDANÇA CRÍTICA: Voltamos para o alias estável.
        # Agora ele vai funcionar porque temos o 'safety_settings' abaixo.
        self.model_name = 'gemini-flash-latest' 
        self.model = genai.GenerativeModel(self.model_name)

    # --- Método 1: Objeto ---
    def generate_dfd_object(self, draft_text: str, user_instructions: str = "") -> str:
        prompt = f"""
        Role: Você é um Especialista em Licitações Públicas da Prefeitura de Braúnas/MG.
        Tarefa: Sua função é reescrever o texto do usuário para criar o campo 'Objeto' de um Documento de Formalização de Demanda (DFD).

        Regras de Estrutura (Padrão Braúnas):
        1. Template Obrigatório: O texto DEVE seguir esta estrutura lógica: "Aquisição de [Nome do Item], por meio de [Modalidade, ex: Sistema de Registro de Preços], para [Finalidade/Evento/Departamento], conforme especificações e quantitativos descritos no Anexo."
        2. Formatação: Texto corrido, sem tópicos (bullet points) e sem negrito. Linguagem impessoal e técnica.

        Entrada do Usuário:
        Rascunho: "{draft_text}"
        Observações do usuário: "{user_instructions}"
        
        Saída (Apenas o texto final):
        """
        return self._generate_safe_content(prompt)

    # --- Método 2: Justificativa ---
    def generate_dfd_justification(self, object_text: str, draft_text: str = "", user_instructions: str = "") -> str:
        
        rascunho_usuario = draft_text if draft_text else "Não informado. Crie uma justificativa genérica baseada no objeto."

        prompt = f"""
        Role: Você é um Especialista em Licitações Públicas da Prefeitura de Braúnas/MG.
        Tarefa: Escrever a 'Justificativa da Necessidade' para um DFD, conectando o Objeto à necessidade pública.

        Contexto (Objeto a ser contratado): "{object_text}"

        Regras de Estrutura (Template Obrigatório - Siga Rígidamente):
        1. Abertura: Comece com algo como "A presente aquisição visa suprir as necessidades operacionais das unidades de saúde do município..." (adaptando ao setor/departamento implícito no objeto).
        2. O Problema (Dor): Explique que "A inexistência ou a escassez desses materiais/serviços compromete diretamente a capacidade de resposta das equipes...".
        3. Conclusão Legal: Finalize OBRIGATORIAMENTE com a frase: "...em consonância com os princípios da economicidade, legalidade e eficiência previstos na Lei nº 14.133/2021."

        Regras de Formatação:
        - Texto corrido em parágrafos.
        - PROIBIDO: Uso de tópicos (bullet points) ou listas.
        - Tom impessoal e justificado pelo interesse público.

        Entrada do Usuário (Motivos específicos):
        Rascunho: "{rascunho_usuario}"
        Instruções extras: "{user_instructions}"
        
        Saída (Apenas o texto final):
        """
        return self._generate_safe_content(prompt)

    def generate_etp_need(self, dfd_object: str, dfd_justification: str, draft_text: str = "", user_instructions: str = "") -> str:
        """
        Gera a 'Descrição da Necessidade' do ETP, focando em riscos e capacidade de resposta.
        """
        
        rascunho_usuario = draft_text if draft_text else "Não informado. Expanda a justificativa do DFD focando nos riscos da não contratação."

        prompt = f"""
        Role: Você é um Especialista em Licitações e Contratos da Prefeitura de Braúnas/MG.
        Tarefa: Redigir a seção 'Descrição da Necessidade' do Estudo Técnico Preliminar (ETP).

        Contexto (Objeto): "{dfd_object}"
        Contexto (Justificativa Inicial do DFD): "{dfd_justification}"
        Fatos novos/Detalhes para o ETP: "{rascunho_usuario}"

        Diretrizes de Conteúdo (Argumentação Obrigatória):
        1. Capacidade de Resposta: Explique como a falta do objeto compromete o atendimento do setor (especialmente se for Saúde/Educação).
        2. Risco: Detalhe EXPLICITAMENTE os riscos à segurança, saúde ou bem-estar dos cidadãos e servidores caso a contratação não ocorra. Seja alarmista no sentido preventivo.
        3. Legalidade: Mencione o dever do município em prestar o serviço com qualidade e eficiência.

        Regras de Formatação:
        - Texto Corrido: Parágrafos formais e coesos.
        - PROIBIDO: ZERO bullet points, tópicos ou listas. O texto deve ser uma narrativa jurídica/técnica.
        - Tom: Técnico, preventivo e focado no interesse público.

        Instruções extras do usuário: "{user_instructions}"

        Saída (Apenas o texto final):
        """
        
        return self._generate_safe_content(prompt)
    
    def generate_etp_requirements(self, dfd_object: str, draft_text: str = "", user_instructions: str = "") -> str:
        """
        Gera os Requisitos Técnicos em texto corrido (blindagem jurídica e sustentabilidade).
        """
        
        exigencias_usuario = draft_text if draft_text else "Seguir padrões de mercado e normas técnicas aplicáveis."

        prompt = f"""
        Role: Especialista em Licitações de Braúnas.
        
        Formatação (CRÍTICA): O texto deve ser escrito em parágrafos corridos. É estritamente proibido o uso de tópicos, listas (bullet points) ou numeração vertical, conforme o padrão documental do município.

        Diretrizes de Conteúdo (O que não pode faltar):
        1. Sustentabilidade: A contratação deve exigir critérios de sustentabilidade ambiental (ex: menor impacto, descarte correto, logística reversa), conforme a Lei 14.133/21.
        2. Qualidade Técnica: Citar a necessidade de o produto ser novo, de primeiro uso e estar em conformidade com as normas técnicas vigentes (ABNT, INMETRO e, se for saúde, ANVISA).
        3. Garantia e Validade: Inserir as exigências de prazo de garantia e condições de entrega.

        Contexto (Objeto): "{dfd_object}"
        Exigências específicas do usuário: "{exigencias_usuario}"
        Instruções extras: "{user_instructions}"

        Tarefa: Escreva os Requisitos da Contratação em texto corrido e formal, abordando sustentabilidade e normas técnicas.
        
        Saída (Apenas o texto final):
        """
        
        return self._generate_safe_content(prompt)

    def generate_etp_motivation(self, dfd_object: str, draft_text: str = "", user_instructions: str = "") -> str:
        """
        Gera a Motivação da contratação (Princípios da Adm. Pública).
        """
        
        rascunho = draft_text if draft_text else "Garantir a continuidade e eficiência do serviço público."

        prompt = f"""
        Role: Especialista em Licitações de Braúnas.
        
        Formatação (CRÍTICA): Texto corrido em parágrafos. NUNCA usar tópicos ou marcadores (bullet points).
        
        Diretrizes de Conteúdo (A Lógica Jurídica):
        1. Dever de Agir: A obrigação do município em prestar o serviço público de forma contínua.
        2. Interesse Público: A vantagem direta para a população (celeridade, qualidade no atendimento).
        3. Eficiência: Citar que a contratação busca a melhor utilização dos recursos públicos.

        Contexto (Objeto): "{dfd_object}"
        Pontos específicos de motivação (Rascunho): "{rascunho}"
        Instruções extras: "{user_instructions}"

        Tarefa: Redija a Motivação da contratação focando no interesse público e nos princípios da legalidade e eficiência.
        
        Saída (Apenas o texto final):
        """
        
        return self._generate_safe_content(prompt)

    def generate_etp_market_analysis(self, dfd_object: str, draft_text: str = "", user_instructions: str = "") -> str:
        """
        Gera o Levantamento de Mercado citando o Decreto 21/2023 e defendendo o SRP.
        """
        
        rascunho = draft_text if draft_text else "Pesquisa realizada em contratações de outros órgãos (Banco de Preços)."

        prompt = f"""
        Role: Especialista em Licitações de Braúnas.
        
        Formatação (CRÍTICA): Texto corrido em parágrafos. PROIBIDO usar tópicos (bullet points).
        
        Diretrizes de Conteúdo (A Lógica do Decreto 21/2023):
        1. Metodologia: Afirmar que a pesquisa seguiu os parâmetros do inciso II, Art. 5º do Decreto Municipal n° 21 de 2023, priorizando contratações de outros órgãos (banco de preços) ou mídia especializada.
        2. Análise de Cenários: Mencione que foram avaliadas diferentes soluções, como a Gestão Direta, a Adesão à Ata de Registro de Preços ("Carona") e o Pregão Eletrônico.
        3. Conclusão (O Pulo do Gato): A menos que o usuário diga o contrário, o texto deve concluir que a solução mais vantajosa é a realização de licitação própria na modalidade Pregão Eletrônico com Sistema de Registro de Preços (SRP), pois oferece flexibilidade de aquisição sem obrigatoriedade de compra total imediata.

        Contexto (Objeto): "{dfd_object}"
        Observações sobre a pesquisa realizada: "{rascunho}"
        Instruções extras do usuário: "{user_instructions}"

        Tarefa: Gere o texto de Levantamento de Mercado citando o Decreto Municipal 21/2023 e defendendo o SRP como melhor opção.
        
        Saída (Apenas o texto final):
        """
        
        return self._generate_safe_content(prompt)
    
    # --- Método Auxiliar Privado (DRY) ---
    def _generate_safe_content(self, prompt: str) -> str:
        """
        Método centralizado para chamar a IA com configurações de segurança.
        Evita repetir código de try/except e safety_settings.
        """
        # Configuração de Segurança (Blindagem)
        safety_settings = {
            HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
            HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
        }

        try:
            response = self.model.generate_content(
                prompt, 
                safety_settings=safety_settings
            )
            
            if response.text:
                return response.text.strip()
            else:
                return "IA retornou vazio (Verifique filtros ou prompt)."
                
        except Exception as e:
            print(f"❌ Erro na IA ({self.model_name}): {e}")
            # Retorna o erro para o frontend ver o que houve
            return f"Erro na geração: {str(e)}"