# 🔥 QA From Hell

O QA From Hell é uma ferramenta de revisão de código sarcástica e impiedosa que utiliza a Chrome Built-in AI (Gemini Nano) para analisar trechos de código e fornecer feedbacks baseados em diferentes personalidades.

## Funcionalidades

* **Três Modos de Análise**:
    * 🤗 **Gentle**: Para quem precisa de um abraço enquanto aprende.
    * 🧐 **Senior QA**: Uma revisão técnica de qualidade, profissional e meticulosa.
    * 😈 **Chaos Engineer**: Críticas ácidas, humor negro e nenhuma piedade com seu código.
* **Análise em Tempo Real**: Utiliza streaming para exibir a resposta da IA enquanto ela é gerada.
* **Suporte a Markdown**: Respostas formatadas com blocos de código, negritos e listas para melhor leitura.

## Pré-requisitos (Crucial)

Este projeto utiliza **tecnologias experimentais**. Para que a IA funcione, você precisa seguir estes passos:

1. Clone o repositório:

```Bash
git clone https://github.com/seu-usuario/qa-from-hell.git
```

2. Abra o arquivo `index.html` diretamente no Chrome ou use uma extensão como o "Live Server" do VS Code.

3. Se você estiver usando `npm`, pode instalar um servidor estático simples:

```Bash
npm install -g serve
serve .
```

## Tecnologias Utilizadas

* **HTML5/CSS3**: Estrutura e estilização moderna com variáveis CSS.
* **JavaScript (ES6+ )**: Lógica assíncrona, Geradores e manipulação de DOM.
* **Chrome Prompt API**: Acesso ao modelo Gemini Nano localmente.
* **Marked.js**: Para renderizar as respostas da IA em HTML formatado.


## Notas de Desenvolvimento

O projeto foi construído focando no aprendizado de Streams e IA integrada ao navegador. Um dos maiores desafios foi lidar com as mudanças constantes na especificação da API (`window.ai` vs `window.LanguageModel`).

Desenvolvido com muito entusiasmo e chocolate por Wilcson Araújo