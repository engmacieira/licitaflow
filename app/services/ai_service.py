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

    def generate_etp_choice_justification(self, dfd_object: str, market_analysis_context: str = "", draft_text: str = "", user_instructions: str = "") -> str:
        """
        Gera a Justificativa da Escolha defendendo Pregão Eletrônico + SRP.
        """
        
        rascunho = draft_text if draft_text else "Adoção do Pregão Eletrônico e SRP pela eficiência."
        contexto_mercado = f"Contexto Prévio (Análise de Mercado): {market_analysis_context}" if market_analysis_context else ""

        prompt = f"""
        Role: Especialista em Licitações de Braúnas.
        
        Formatação (CRÍTICA): Texto corrido em parágrafos. PROIBIDO usar tópicos (bullet points).
        
        Diretrizes de Conteúdo (Defesa do Modelo de Braúnas):
        1. Defesa da Modalidade: Defender o Pregão Eletrônico como a modalidade que garante maior competitividade e transparência.
        2. Defesa do Mecanismo (SRP): Defender o Sistema de Registro de Preços. Argumentos obrigatórios:
           - Flexibilidade: Permite aquisições graduais conforme a necessidade.
           - Eficiência: Evita custos de estocagem desnecessária e risco de vencimento de produtos.
           - Economicidade: Paga-se apenas pelo que for efetivamente demandado.

        Contexto (Objeto): "{dfd_object}"
        {contexto_mercado}
        Razões específicas do usuário: "{rascunho}"
        Instruções extras: "{user_instructions}"

        Tarefa: Redija a Justificativa da Escolha defendendo o Pregão Eletrônico e o SRP com base na eficiência e flexibilidade.
        
        Saída (Apenas o texto final):
        """
        
        return self._generate_safe_content(prompt)

    def generate_etp_solution_description(self, dfd_object: str, requirements_text: str = "", draft_text: str = "", user_instructions: str = "") -> str:
        """
        Gera a Descrição da Solução cobrindo o Ciclo de Vida (Aquisição -> Uso -> Descarte).
        """
        
        rascunho = draft_text if draft_text else "Entrega conforme demanda e gestão pelo fiscal do contrato."
        req_contexto = f"Requisitos Técnicos já definidos: {requirements_text}" if requirements_text else ""

        prompt = f"""
        Role: Especialista em Licitações de Braúnas.
        
        Formatação (CRÍTICA): Texto corrido em parágrafos. PROIBIDO usar tópicos ou listas (bullet points).
        
        Diretrizes de Conteúdo (O Ciclo de Vida):
        1. O Objeto: O que é exatamente (retome o objeto).
        2. O Modo de Execução: Como será entregue (parcelado, imediato, sob demanda, local de entrega).
        3. A Gestão: Citar que haverá fiscalização e recebimento provisório/definitivo.
        4. O Ciclo de Vida: Mencionar brevemente o uso pretendido e, se aplicável, o descarte adequado (logística reversa), conectando com o tópico de sustentabilidade.

        Contexto (Objeto): "{dfd_object}"
        {req_contexto}
        Instruções logísticas do usuário: "{rascunho}"
        Instruções extras: "{user_instructions}"

        Tarefa: Descreva a Solução como um todo, considerando o ciclo de vida do objeto (aquisição, entrega, uso e descarte) e a gestão contratual.
        
        Saída (Apenas o texto final):
        """
        
        return self._generate_safe_content(prompt)
    
    def generate_etp_parceling_justification(self, dfd_object: str, draft_text: str = "", user_instructions: str = "") -> str:
        """
        Gera a Justificativa do Parcelamento (Regra: Súmula 247 TCU).
        """
        
        rascunho = draft_text if draft_text else "A regra é o parcelamento para ampliar a competição."

        prompt = f"""
        Role: Especialista em Licitações de Braúnas.
        
        Formatação (CRÍTICA): Texto corrido em parágrafos. PROIBIDO usar tópicos ou listas (bullet points).
        
        Diretrizes de Conteúdo (Lógica de Braúnas):
        1. Regra Geral (Parcelamento): O texto deve afirmar que o parcelamento do objeto foi a opção escolhida, em conformidade com a Súmula 247 do TCU.
        2. Os 3 Pilares (se parcelado):
           - "Assegurar a obtenção da proposta mais vantajosa."
           - "Aumentar a competitividade, permitindo a participação de um maior número de fornecedores, inclusive micro e pequenas empresas."
           - "Evitar a concentração contratual excessiva."
        3. Exceção (Não Parcelamento): APENAS se o rascunho indicar explicitamente que o objeto é indivisível (ex: "kit único", "risco técnico"), a IA deve argumentar que o parcelamento traria "perda de economia de escala" ou "risco à integridade técnica do conjunto".

        Contexto (Objeto): "{dfd_object}"
        Observações do usuário (Decisão de parcelar ou não): "{rascunho}"
        Instruções extras: "{user_instructions}"

        Tarefa: Redija a Justificativa para Parcelamento focando na competitividade e na proposta mais vantajosa.
        
        Saída (Apenas o texto final):
        """
        
        return self._generate_safe_content(prompt)
    
    def generate_etp_results(self, dfd_object: str, draft_text: str = "", user_instructions: str = "") -> str:
        """
        Gera o Demonstrativo de Resultados (Quantitativo vs Qualitativo).
        """
        
        rascunho = draft_text if draft_text else "Melhoria da eficiência e qualidade do atendimento."

        prompt = f"""
        Role: Especialista em Licitações de Braúnas.
        
        Formatação (CRÍTICA): Texto corrido em parágrafos. PROIBIDO usar tópicos ou listas (bullet points).
        
        Diretrizes de Conteúdo (As Duas Esferas de Resultados):
        1. Resultados Quantitativos: Focar na continuidade do serviço, padronização, redução de custos operacionais e otimização dos recursos públicos.
        2. Resultados Qualitativos: Focar na elevação da qualidade do atendimento, aumento da confiança da população nos serviços públicos e, especialmente, na segurança sanitária e no fortalecimento das ações de saúde.

        Contexto (Objeto): "{dfd_object}"
        Resultados específicos desejados (Rascunho): "{rascunho}"
        Instruções extras: "{user_instructions}"

        Tarefa: Descreva os resultados pretendidos abordando os aspectos quantitativos (eficiência) e qualitativos (impacto social e segurança).
        
        Saída (Apenas o texto final):
        """
        
        return self._generate_safe_content(prompt)

    def generate_etp_prior_measures(self, dfd_object: str, draft_text: str = "", user_instructions: str = "") -> str:
        """
        Gera as Providências Prévias (Foco em celeridade vs necessidades específicas).
        """
        
        rascunho = draft_text if draft_text else "Padrão: sem necessidade de obras ou mudanças físicas."

        prompt = f"""
        Role: Especialista em Licitações de Braúnas.
        
        Formatação (CRÍTICA): Texto corrido em parágrafos. PROIBIDO usar tópicos ou listas (bullet points).
        
        Diretrizes de Conteúdo (Lógica Condicional):
        1. Cenário Padrão (Se o rascunho for vazio ou indicar simplicidade): Argumentar que não há necessidade de providências prévias significativas (obras, elétrica, etc.).
           - Argumento obrigatório: "Os bens não demandam preparação específica da Administração para seu recebimento."
           - Ação Administrativa: Citar apenas que a única providência necessária é a designação formal da equipe de fiscalização e gestão do contrato.
        2. Cenário Específico (Se o rascunho citar obras/instalações): Incorpore a necessidade descrita mantendo a formalidade.

        Contexto (Objeto): "{dfd_object}"
        Providências específicas informadas (Rascunho): "{rascunho}"
        Instruções extras: "{user_instructions}"

        Tarefa: Redija as Providências Prévias. Se não houver especificidades, use o texto padrão de que não são necessárias alterações físicas, apenas a designação dos fiscais.
        
        Saída (Apenas o texto final):
        """
        
        return self._generate_safe_content(prompt)
    
    def generate_etp_environmental_impacts(self, dfd_object: str, draft_text: str = "", user_instructions: str = "") -> str:
        """
        Gera os Impactos Ambientais (Mitigação normativa CONAMA/ANVISA).
        """
        
        rascunho = draft_text if draft_text else "Geração de resíduos comuns e de saúde, gerenciáveis pelas rotinas atuais."

        prompt = f"""
        Role: Especialista em Licitações de Braúnas.
        
        Formatação (CRÍTICA): Texto corrido em parágrafos. PROIBIDO usar tópicos ou listas (bullet points).
        
        Diretrizes de Conteúdo (Lógica da "Controllability"):
        1. Reconhecimento: Admitir que a contratação pode gerar impactos (geralmente descarte de resíduos ou embalagens).
        2. Argumento de Controle: Afirmar categoricamente que tais impactos são "controláveis e gerenciáveis".
        3. Fundamentação Legal (Saúde): Citar que o Município adota as rotinas previstas na Resolução CONAMA nº 358/2005 e na RDC ANVISA nº 222/2018 (Boas Práticas de Gerenciamento de Resíduos de Serviços de Saúde).
        4. Conclusão: A contratação não traz riscos ambientais novos que não possam ser mitigados pelas rotinas já existentes.

        Contexto (Objeto): "{dfd_object}"
        Riscos específicos (Rascunho): "{rascunho}"
        Instruções extras: "{user_instructions}"

        Tarefa: Redija os Impactos Ambientais argumentando que são gerenciáveis conforme CONAMA 358/2005 e RDC ANVISA 222/2018.
        
        Saída (Apenas o texto final):
        """
        
        return self._generate_safe_content(prompt)

    def generate_etp_viability(self, dfd_object: str, draft_text: str = "", user_instructions: str = "") -> str:
        """
        Gera a Conclusão da Viabilidade (O 'De Acordo' final).
        """
        
        rascunho = draft_text if draft_text else "A contratação é viável e oportuna."

        prompt = f"""
        Role: Especialista em Licitações de Braúnas.
        
        Formatação (CRÍTICA): Texto corrido em parágrafos. PROIBIDO usar tópicos ou listas (bullet points).
        
        Diretrizes de Conteúdo (O "Carimbo" de Aprovação):
        1. Conclusão Categórica: Afirmar categoricamente que a contratação é "plenamente viável".
        2. Os 4 Pilares da Viabilidade: Citar explicitamente que a viabilidade foi verificada nos aspectos:
           - Técnico: A solução atende à necessidade.
           - Legal: Está em conformidade com a Lei 14.133/21.
           - Orçamentário: Há previsão (sem citar valores específicos aqui).
           - Administrativo: A gestão é possível.
        3. Desfecho: Recomendar o prosseguimento para o Termo de Referência.

        Contexto (Objeto): "{dfd_object}"
        Observações finais (Rascunho): "{rascunho}"
        Instruções extras: "{user_instructions}"

        Tarefa: Redija a Conclusão da Viabilidade da Contratação, afirmando que ela é viável sob os aspectos técnico, legal, econômico e administrativo.
        
        Saída (Apenas o texto final):
        """
        
        return self._generate_safe_content(prompt)
    
    def generate_consolidated_object(self, objects_list: list[str]) -> str:
        """
        Recebe uma lista de objetos de vários DFDs e cria um texto unificado para o ETP.
        """
        lista_formatada = "\n".join([f"- {obj}" for obj in objects_list])
        
        prompt = f"""
        Role: Especialista em Licitações Públicas.
        Tarefa: Unificar múltiplos objetos de DFDs (Documentos de Formalização da Demanda) em um único Objeto de ETP (Estudo Técnico Preliminar).
        
        Regras:
        1. O texto deve ser formal, técnico e abrangente.
        2. Use termos como "Registro de Preços", "Aquisição de", "Contratação de".
        3. Não cite nomes de secretarias específicas no objeto, use termos genéricos como "Secretarias Municipais" ou "Demandantes".
        4. O objetivo é criar um "Guarda-Chuva" que cubra todos os itens.

        Lista de Objetos Originais:
        {lista_formatada}

        Saída (Apenas o texto do Objeto Unificado):
        """
        return self._generate_safe_content(prompt)

    def generate_consolidated_justification(self, justifications_list: list[str]) -> str:
        """
        Sintetiza as justificativas dos DFDs em uma justificativa global de ganho de escala.
        """
        lista_formatada = "\n".join([f"- {jus}" for jus in justifications_list])
        
        prompt = f"""
        Role: Especialista em Compras Públicas.
        Tarefa: Criar uma Justificativa da Necessidade para um ETP Consolidado, baseada nas justificativas individuais.
        
        Diretrizes:
        1. Foque no "Ganho de Escala" e na "Padronização".
        2. Explique que a consolidação visa a economia processual e melhores preços.
        3. Mencione que os itens são essenciais para o funcionamento contínuo das unidades.

        Justificativas Originais:
        {lista_formatada}

        Saída (Texto corrido, 1 ou 2 parágrafos):
        """
        return self._generate_safe_content(prompt)
    
    def generate_consolidated_text(self, text_list: list[str], type: str) -> str:
        """
        Gera texto unificado. type pode ser 'objeto' ou 'justificativa'.
        """
        lista_formatada = "\n".join([f"- {t}" for t in text_list])
        
        if type == 'objeto':
            prompt = f"""
            Role: Especialista em Licitações.
            Tarefa: Unificar múltiplos objetos de DFDs em um único Objeto de ETP.
            Regras: Crie um texto formal, técnico e abrangente (ex: "Registro de Preços para aquisição de...").
            Itens Originais:
            {lista_formatada}
            Saída (Apenas o texto final):
            """
        else:
            prompt = f"""
            Role: Especialista em Compras Públicas.
            Tarefa: Criar uma Justificativa de Consolidação baseada nas demandas individuais.
            Foco: Ganho de escala, padronização e economia processual.
            Justificativas Originais:
            {lista_formatada}
            Saída (Texto corrido, 1 parágrafo):
            """
            
        return self._generate_safe_content(prompt)
    
    def generate_risks(self, etp_object: str) -> str:
        """
        Gera uma lista de riscos prováveis em formato JSON para o frontend.
        """
        prompt = f"""
        Role: Especialista em Gestão de Riscos em Contratações Públicas (Lei 14.133/21).
        Tarefa: Identificar 3 a 5 riscos principais para o objeto abaixo e sugerir medidas preventivas.
        
        Objeto da Contratação: "{etp_object}"
        
        Formato de Saída (JSON Array estrito, sem markdown):
        [
            {{
                "descricao_risco": "Descrição curta do risco",
                "probabilidade": "Baixa" | "Média" | "Alta",
                "impacto": "Baixo" | "Médio" | "Alto",
                "medida_preventiva": "Ação para mitigar",
                "responsavel": "Fiscal do Contrato" | "Gestor" | "Contratada"
            }}
        ]
        """
        # Nota: O 'generation_config={"response_mime_type": "application/json"}' 
        # seria ideal aqui se estivéssemos usando a SDK mais nova, 
        # mas vamos pedir texto puro e tratar no front ou backend.
        
        return self._generate_safe_content(prompt)

    def generate_tr_clause(self, section: str, etp_data: str, risks_data: str) -> str:
        """
        Gera uma cláusula específica do TR baseada no ETP e Riscos.
        """
        prompts = {
            "obrigacoes": "Escreva as 'Obrigações da Contratada' e 'Obrigações da Contratante' detalhadas, focando em prazos, qualidade e garantias.",
            "pagamento": "Escreva a cláusula de 'Critérios de Pagamento' e 'Liquidação', seguindo a Lei 14.133/21 (pagamento vinculado à entrega/aceite).",
            "execucao": "Escreva a 'Estratégia de Execução' e 'Recebimento do Objeto' (Provisório e Definitivo).",
            "qualificacao": "Escreva os requisitos de 'Habilitação Técnica' e 'Qualificação Econômica' necessários para este objeto."
        }
        
        instruction = prompts.get(section, "Escreva uma cláusula técnica e jurídica adequada para Termo de Referência.")

        prompt = f"""
        Role: Advogado Especialista em Licitações e Contratos Administrativos.
        Tarefa: Redigir a cláusula de TR especificada abaixo.
        
        Contexto do ETP (Planejamento):
        {etp_data}
        
        Contexto dos Riscos (Para mitigar nas obrigações):
        {risks_data}
        
        Sua Missão:
        {instruction}
        
        Saída: Texto formatado em Markdown, pronto para copiar e colar no documento. Use linguagem formal jurídica.
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