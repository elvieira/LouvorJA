# Análise do Bug: "Música volta para o começo ao avançar/voltar slides ou barra de progresso"

## Sintomas Reportados
- Ao reproduzir a música específica "Tudo por ele", se o usuário tentar avançar a música pela barra de progresso, a reprodução de áudio é resetada para o início (`0:00`).
- Ao usar os botões de "Próximo Slide" ou "Slide Anterior", ou clicar diretamente em um slide específico na lista, a letra (slide) muda corretamente, mas o áudio **volta a tocar do começo**.
- O bug **não** acontece em todas as músicas. O Hino 1 ("Santo, Santo, Santo"), por exemplo, permite avançar o áudio, a barra de progresso e os slides normalmente e de forma sincronizada, mas outros como o Tudo por ele, a música volta para o começo.
- A reprodução contínua (sem interferência) funciona e os slides de "Tudo por ele" avançam sozinhos no tempo correto, comprovando que a música **tem sim os tempos (timestamps) cadastrados** e sincronizados.