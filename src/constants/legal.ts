export interface LegalSubsection {
  title: string;
  text?: string;
  bullets?: string[];
}

export interface LegalSection {
  id: string;
  title: string;
  badge?: string;
  text?: string;
  bullets?: string[];
  subsections?: LegalSubsection[];
}

export interface LegalTab {
  id: "terms" | "privacy" | "copyright";
  title: string;
  icon: string;
  summary: string;
  sections: LegalSection[];
}

export interface LegalDocumentLocale {
  modalTitle: string;
  modalSubtitle: string;
  closeBtn: string;
  badgeSourceAvailable: string;
  badgeFreeUse: string;
  tabs: LegalTab[];
}

export const LEGAL_DOCS: Record<"pt" | "es", LegalDocumentLocale> = {
  pt: {
    modalTitle: "Termos de Uso e Política de Privacidade",
    modalSubtitle: "Informações legais, proteção de dados e diretrizes de uso do Louvor JA",
    closeBtn: "Entendido",
    badgeSourceAvailable: "Source-Available • Direitos Reservados",
    badgeFreeUse: "Uso Gratuito para Cultos",
    tabs: [
      {
        id: "terms",
        title: "Termos de Uso (EULA)",
        icon: "mdi-file-document-outline",
        summary: "Licença de uso final, finalidade litúrgica sem fins lucrativos e regras de utilização.",
        sections: [
          {
            id: "acceptance",
            title: "1. Aceitação dos Termos",
            text: "Ao instalar, acessar ou utilizar o programa Louvor JA (versão Flute), você concorda integralmente com estes Termos de Uso e Licença de Usuário Final. Caso não concorde com qualquer cláusula, não utilize o programa.",
          },
          {
            id: "license_model",
            title: "2. Modelo de Licença e Propriedade Intelectual",
            text: "O Louvor JA é um projeto da organização Louvor JA, originalmente idealizado e criado por Mayco Rolbuche, com esta versão (Flute) arquitetada e desenvolvida por Elias Vieira. O software adota o modelo Source-Available (Código Aberto apenas para visualização e estudo):",
            bullets: [
              "Todos os direitos autorais, marcas, código-fonte e recursos visuais pertencem aos seus respectivos autores e à organização Louvor JA.",
              "Não há licença MIT: o projeto não autoriza a cópia, modificação, redistribuição ou criação de versões derivadas sem autorização prévia por escrito.",
              "É concedida ao usuário final uma licença gratuita, não exclusiva, revogável e intransferível para uso em computadores pessoais e comunitários em cultos e celebrações religiosas sem fins lucrativos.",
            ],
          },
          {
            id: "restrictions",
            title: "3. Restrições e Uso Aceitável",
            text: "É estritamente proibido:",
            bullets: [
              "Comercializar, cobrar pelo software ou revender pacotes com o instalador do programa;",
              "Distribuir versões adulteradas ou empacotadas com anúncios ou malware fora dos canais oficiais;",
              "Remover avisos de direitos autorais ou créditos dos desenvolvedores;",
              "Utilizar o programa para fins ilícitos ou em desconformidade com a legislação aplicável.",
            ],
          },
          {
            id: "as_is",
            title: "4. Isenção de Garantias (AS IS) e Recomendações",
            text: "O software é disponibilizado 'no estado em que se encontra' (AS IS), sem garantias expressas ou implícitas de infalibilidade técnica ou compatibilidade irrestrita.",
            bullets: [
              "Por se tratar de ferramenta utilizada em transmissões e cultos ao vivo, orientamos que o operador sempre teste previamente as projeções, telas e áudios antes das cerimônias.",
              "O desenvolvedor não se responsabiliza por eventuais falhas durante transmissões, desconexões de rede ou perdas de dados locais.",
            ],
          },
        ],
      },
      {
        id: "privacy",
        title: "Privacidade e Telemetria",
        icon: "mdi-shield-check-outline",
        summary: "Conformidade com a LGPD, telemetria técnica anônima e controle total do usuário.",
        sections: [
          {
            id: "zero_personal_data",
            title: "1. Compromisso: Zero Dados Pessoais Identificáveis",
            text: "O Louvor JA respeita a Lei Geral de Proteção de Dados (LGPD — Lei 13.709/2018). Nós NÃO coletamos dados pessoais como nome, CPF, e-mail, telefone, senhas ou histórico de navegação. Não é necessário criar conta para utilizar o programa.",
          },
          {
            id: "telemetry_metrics",
            title: "2. O que a Telemetria Anônima Coleta",
            text: "Para garantir a estabilidade do software e identificar falhas com agilidade, quando ativada, a telemetria transmite parâmetros técnicos e anônimos:",
            bullets: [
              "Identificador de instalação anônimo (UUID gerado aleatoriamente na máquina, sem vínculo a pessoas);",
              "Informações do sistema: versão do SO, arquitetura (x64/arm64), versão do app e idioma;",
              "Hardware de projeção: quantidade de monitores e resolução de tela (para aprimorar o suporte multitelas);",
              "Métricas litúrgicas agregadas: hinos tocados, slides exibidos, tempo de execução e motivo de parada;",
              "Relatórios técnicos de erros (crash logs anônimos) para correção proativa de falhas.",
            ],
          },
          {
            id: "opt_out",
            title: "3. Controle do Usuário e Como Desativar (Opt-Out)",
            text: "Você pode desativar o envio de telemetria e diagnósticos a qualquer momento em: Configurações do Sistema > Telemetria & Diagnóstico Anônimo. Ao desligar a chave, nenhuma métrica técnica será transmitida.",
          },
          {
            id: "security",
            title: "4. Armazenamento Local e Transmissão Criptografada",
            text: "Seus dados de preferências, históricos e bases de hinos permanecem salvos localmente no seu computador. Quando há comunicação com o servidor, ela é realizada sob criptografia de ponta a ponta (HTTPS/TLS).",
          },
        ],
      },
      {
        id: "copyright",
        title: "Direitos Autorais",
        icon: "mdi-music-clef-treble",
        summary: "Amparo na Lei 9.610/98 (Art. 46, XI) e Constituição Federal (Art. 5º, VI) para cultos.",
        sections: [
          {
            id: "third_party_content",
            title: "1. Titularidade das Obras Litúrgicas",
            text: "O Louvor JA atua como organizador e reprodutor de mídias para apoio aos cultos. As letras de hinos, partituras, áudios e traduções bíblicas pertencem aos seus respectivos autores, compositores e editoras (como CPB, Sociedades Bíblicas e gravadoras). O programa não reivindica propriedade sobre essas obras.",
          },
          {
            id: "legal_exception",
            title: "2. A Exceção Litúrgica na Legislação Brasileira",
            text: "A reprodução de hinos e textos em cultos presenciais sem fins lucrativos está plenamente respaldada por lei:",
            bullets: [
              "Art. 46, XI da Lei 9.610/1998: Não constitui ofensa aos direitos autorais a utilização de obras literárias, artísticas e fonogramas em cultos religiosos sem intuito de lucro.",
              "Art. 5º, VI da Constituição Federal: Inviolabilidade da liberdade de consciência e crença, assegurando o livre exercício dos cultos e a proteção a suas liturgias.",
            ],
          },
          {
            id: "broadcasts",
            title: "3. Transmissões Online (YouTube / Redes Sociais)",
            text: "Em caso de transmissão do culto pela internet, a igreja local deve observar as diretrizes de direitos autorais das plataformas hospedeiras (como Content ID do YouTube), sobre as quais o programa não possui ingerência.",
          },
          {
            id: "contact_legal",
            title: "4. Contato dos Titulares",
            text: "Caso algum titular de direitos queira esclarecimentos ou correções de créditos, disponibilizamos o canal direto pelo e-mail: elvieiradev@gmail.com.",
          },
        ],
      },
    ],
  },
  es: {
    modalTitle: "Términos de Uso y Política de Privacidad",
    modalSubtitle: "Información legal, protección de datos y pautas de uso de Louvor JA",
    closeBtn: "Entendido",
    badgeSourceAvailable: "Source-Available • Derechos Reservados",
    badgeFreeUse: "Uso Gratuito para Cultos",
    tabs: [
      {
        id: "terms",
        title: "Términos de Uso (EULA)",
        icon: "mdi-file-document-outline",
        summary: "Licencia de usuario final, finalidad litúrgica sin fines de lucro y normas de uso.",
        sections: [
          {
            id: "acceptance",
            title: "1. Aceptación de los Términos",
            text: "Al instalar, acceder o utilizar el programa Louvor JA (versión Flute), usted acepta plenamente estos Términos de Uso y Licencia de Usuario Final. Si no está de acuerdo con alguna cláusula, no utilice el programa.",
          },
          {
            id: "license_model",
            title: "2. Modelo de Licencia y Propiedad Intelectual",
            text: "Louvor JA es un proyecto de la organización Louvor JA, originalmente concebido y creado por Mayco Rolbuche, con esta versión (Flute) desarrollada y mantenida por Elias Vieira. El software adopta el modelo Source-Available (Código visible sólo para inspección y aprendizaje):",
            bullets: [
              "Todos los derechos de autor, marcas, código fuente y elementos visuales pertenecen a sus respectivos autores y a la organización Louvor JA.",
              "No cuenta con licencia MIT: el proyecto no autoriza la copia, modificación, redistribución ni obras derivadas sin autorización previa por escrito.",
              "Se concede al usuario final una licencia gratuita, no exclusiva, revocable e intransferible para su uso en computadoras personales y comunitarias en cultos y ceremonias religiosas sin fines de lucro.",
            ],
          },
          {
            id: "restrictions",
            title: "3. Restricciones y Uso Aceptable",
            text: "Queda estrictamente prohibido:",
            bullets: [
              "Comercializar, cobrar por el software o revender paquetes con el instalador del programa;",
              "Distribuir versiones adulteradas o con publicidad fuera de los canales oficiales;",
              "Eliminar avisos de derechos de autor o créditos;",
              "Utilizar el programa para fines ilícitos o en desacuerdo con la legislación aplicable.",
            ],
          },
          {
            id: "as_is",
            title: "4. Exención de Garantías (AS IS)",
            text: "El software se entrega 'tal cual' (AS IS), sin garantías explícitas ni implícitas de infalibilidad técnica o compatibilidad absoluta.",
            bullets: [
              "Al ser una herramienta utilizada en cultos y eventos en vivo, se recomienda que el operador pruebe previamente proyecciones, pantallas y audios antes de las ceremonias.",
              "El desarrollador no se responsabiliza por fallas imprevistas durante transmisiones, desconexiones o pérdidas de datos locales.",
            ],
          },
        ],
      },
      {
        id: "privacy",
        title: "Privacidad y Telemetría",
        icon: "mdi-shield-check-outline",
        summary: "Protección de datos, telemetría técnica anónima y control total del usuario.",
        sections: [
          {
            id: "zero_personal_data",
            title: "1. Compromiso: Cero Datos Personales Identificables",
            text: "Louvor JA respeta las normativas de privacidad. NO recopilamos datos personales como nombre, identificación, correo electrónico, teléfono ni contraseñas. No se requiere registro de cuenta para usar el programa.",
          },
          {
            id: "telemetry_metrics",
            title: "2. Qué Recopila la Telemetría Anónima",
            text: "Para garantizar la estabilidad del software e identificar errores técnicos con agilidad, cuando está habilitada, la telemetría transmite parámetros técnicos y anónimos:",
            bullets: [
              "Identificador de instalación anónimo (UUID generado aleatoriamente en la máquina, sin vínculo a personas);",
              "Información del sistema: versión del SO, arquitectura (x64/arm64), versión del programa e idioma;",
              "Hardware de proyección: cantidad de monitores y resolución de pantalla (para optimizar la compatibilidad multipantalla);",
              "Métricas litúrgicas agregadas: himnos reproducidos, diapositivas mostradas, tiempo de reproducción y causa de detención;",
              "Informes técnicos de error (crash logs anónimos) para corrección proactiva de fallas.",
            ],
          },
          {
            id: "opt_out",
            title: "3. Control del Usuario y Desactivación (Opt-Out)",
            text: "Puede desactivar el envío de telemetría y diagnósticos en cualquier momento en: Configuración del Sistema > Telemetría y Diagnóstico Anónimo. Al apagar la opción, ninguna métrica técnica será transmitida.",
          },
          {
            id: "security",
            title: "4. Almacenamiento Local y Transmisión Cifrada",
            text: "Sus preferencias, historiales y bases de himnos se guardan localmente en su computadora. Toda comunicación con los servidores se realiza bajo cifrado de extremo a extremo (HTTPS/TLS).",
          },
        ],
      },
      {
        id: "copyright",
        title: "Derechos de Autor",
        icon: "mdi-music-clef-treble",
        summary: "Amparo legal para el uso de himnos y medios en cultos religiosos sin fines de lucro.",
        sections: [
          {
            id: "third_party_content",
            title: "1. Titularidad de los Contenidos Litúrgicos",
            text: "Louvor JA actúa como organizador y reproductor de medios para cultos. Las letras de himnos, partituras, audios y traducciones bíblicas pertenecen a sus respectivos autores y editoriales religiosas. El programa no reclama propiedad sobre tales obras.",
          },
          {
            id: "legal_exception",
            title: "2. Excepción Litúrgica para Cultos Religiosos",
            text: "La reproducción de himnos y textos sagrados en ceremonias religiosas presenciales sin fines de lucro está amparada legalmente por las excepciones de uso religioso y libertad de culto sin ánimo de lucro.",
          },
          {
            id: "broadcasts",
            title: "3. Transmisiones en Línea (YouTube / Redes Sociales)",
            text: "En caso de transmitir cultos por internet, la iglesia local debe observar las normativas de derechos de autor de las plataformas de video (como Content ID de YouTube).",
          },
          {
            id: "contact_legal",
            title: "4. Contacto de Titulares",
            text: "Para observaciones, consultas o aclaraciones sobre créditos, puede comunicarse a: elvieiradev@gmail.com.",
          },
        ],
      },
    ],
  },
};
