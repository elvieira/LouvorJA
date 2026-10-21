# Política de Privacidade, Telemetria e Proteção de Dados (LGPD)

**Louvor JA — Versão Flute**  
*Data de Vigência: Outubro de 2026*  
*Projeto e Organização: Louvor JA*  
*Em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)*

---

## 1. Nosso Compromisso com a sua Privacidade

O aplicativo **Louvor JA** foi projetado com respeito absoluto à privacidade de seus usuários, operadores de som e membros da igreja.

**Nós NÃO coletamos dados pessoais identificáveis.**  
O Louvor JA não exige cadastro de conta, não solicita endereço de e-mail, nome completo, CPF, número de telefone, senhas nem informações financeiras.

---

## 2. Telemetria e Diagnósticos Anônimos

Para garantir a estabilidade do programa, corrigir eventuais falhas (bugs) e compreender quais recursos necessitam de melhorias, o Louvor JA dispõe de um serviço de **telemetria técnica e anônima**.

### 2.1. O que é coletado quando a telemetria está ativada:
Quando o recurso de telemetria está habilitado, o Software transmite exclusivamente os seguintes parâmetros técnicos:

1. **Identificador Anônimo de Instalação (`installation_id`)**: Um código aleatório (UUID v4) gerado localmente na primeira execução da máquina. Este código é puramente técnico e não está associado a nenhuma pessoa física ou jurídica.
2. **Identificador de Sessão (`session_id`)**: Código temporário que identifica a execução atual do aplicativo.
3. **Informações do Ambiente Operacional**:
   - Plataforma e Nome do Sistema Operacional (ex: Windows, macOS, Linux);
   - Arquitetura do processador (ex: x64, arm64);
   - Versão do Louvor JA instalada;
   - Idioma selecionado no sistema (Português, Espanhol).
4. **Informações de Telas e Projeção**:
   - Quantidade de monitores conectados e resolução de tela (dados essenciais para aprimorar o suporte a projetores e telas auxiliares).
5. **Métricas Agregadas de Execução de Louvores**:
   - Identificação do hino ou música executada (título, álbum e modo de áudio);
   - Quantidade de slides exibidos e porcentagem de conclusão;
   - Duração da reprodução e motivo do encerramento (concluído, interrompido, app fechado).
6. **Relatórios Técnicos de Erros (Crash Reports)**:
   - Registro de exceções não tratadas e falhas críticas no frontend ou processo Electron, permitindo a correção proativa de instabilidades.

### 2.2. O que NUNCA é coletado:
- Nomes de usuários, operadores ou pregadores;
- Letras personalizadas, anotações locais ou liturgias confidenciais;
- Arquivos pessoais presentes no computador;
- Endereço IP para fins de rastreamento ou criação de perfis comportamentais;
- Dados de navegação web externa ou cookies de terceiros.

---

## 3. Base Legal e Finalidade (LGPD)

O tratamento das métricas técnicas e de diagnóstico está amparado no **Artigo 7º, inciso IX da Lei nº 13.709/2018 (LGPD)** — com base no **legítimo interesse do desenvolvedor** em:
- Garantir a funcionalidade, segurança e alta disponibilidade do Software;
- Identificar e reparar falhas técnicas que afetem os cultos ao vivo;
- Otimizar a performance de carregamento e compatibilidade com projetores e placas de vídeo.

---

## 4. Controle do Usuário: Como Desativar a Telemetria (Opt-Out)

A coleta de diagnósticos e telemetria é totalmente configurável pelo usuário. Se você preferir não compartilhar essas métricas técnicas:

1. Abra o **Louvor JA**;
2. Acesse o menu lateral de **Configurações do Sistema** (ícone de engrenagem);
3. Localize a opção **Telemetria & Diagnóstico Anônimo**;
4. Desative a chave de seleção (*toggle*).

Uma vez desativada, nenhuma métrica de uso ou evento de diagnóstico será transmitido aos nossos servidores.

---

## 5. Armazenamento Local e Segurança

1. **Dados Locais**: Preferências de uso, histórico litúrgico, hinos favoritos e bases de dados baixadas ficam armazenados estritamente na máquina local do usuário (IndexedDB / armazenamento local do Electron).
2. **Transmissão Segura**: Todos os dados de telemetria e downloads de catálogo são trafegados exclusivamente por conexões criptografadas de ponta a ponta (**HTTPS/TLS**).

---

## 6. Contato do Encarregado de Dados

Para quaisquer dúvidas, esclarecimentos ou solicitações relativas a esta Política de Privacidade e ao tratamento de dados técnicos, entre em contato diretamente com o responsável pelo projeto:

- **Elias Vieira**
- **E-mail**: `elvieiradev@gmail.com`
