const aiContext = {
    session: null,
    abortController: null,
    isGenerating: false,
};

const elements = {
    form: document.getElementById('roast-form'),
    questionInput: document.getElementById('code'),
    button: document.getElementById('submit-btn'),
    output: document.getElementById('result'),
    error: document.getElementById('error'),
}

const counter = document.getElementById('counter');
if (counter && elements.questionInput) {
    elements.questionInput.addEventListener('input', () => {
        counter.textContent = elements.questionInput.value.length;
    });
}

function setupEventListeners() {
    elements.form.addEventListener('submit', async (event) => {
        event.preventDefault();

        if (aiContext.isGenerating) {
            stopGeneration();
            return;
        }

        await onSubmitQuestion();
    });
}

async function onSubmitQuestion() {
    const question = elements.questionInput.value.trim();

    if (!question) return;

    const mode = document.querySelector('input[name="mode"]:checked')?.value

    try {
        toggleSendOrStopButton(true)

        elements.output.classList.remove('hidden');
        elements.output.innerHTML = '<div class="spinner"></div> Processing your code...';
        elements.error.classList.add('hidden');


        const aiResponseChunks = askAI(question, mode);

        let fullResponse = '';

        for await (const chunk of aiResponseChunks) {
            if (aiContext.abortController?.signal.aborted) break;
            fullResponse += chunk;
            elements.output.innerHTML = marked.parse(fullResponse);
        }

    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('AI generation error:', error);
            elements.output.textContent = 'Error generating response.' + error.message;
            elements.error.classList.remove('hidden');
            elements.output.classList.add('hidden');
        }
    } finally {
        toggleSendOrStopButton(false);
    }
}

function toggleSendOrStopButton(isGenerating) {
    aiContext.isGenerating = isGenerating;
    if (isGenerating) {
        elements.button.textContent = 'Stop';
        elements.button.classList.add('stop-button');
    } else {
        elements.button.textContent = 'Analyze';
        elements.button.classList.remove('stop-button');
    }
}

function stopGeneration() {
    if (aiContext.abortController) {
        aiContext.abortController.abort();
    }
    toggleSendOrStopButton(false);
}

async function* askAI(question, mode) {
    aiContext.abortController?.abort();
    aiContext.abortController = new AbortController();

    const aiApi = await window.LanguageModel.availability();
    if (aiApi !== "available") {
        throw new Error("AI API not available.");
    }

    const systemPrompts = {
        'gentle': "Você é um revisor de código gentil e encorajador. Aponte problemas com carinho e sugestões construtivas. Tom acolhedor, emojis ok. Responda em português.",
        'senior-qa': "Você é um Engenheiro de QA Sênior meticuloso. Identifique bugs, edge cases, testes faltando e problemas de qualidade com linguagem precisa e profissional. Responda em português.",
        'chaos': "Você é um Chaos Engineer que destrói código com humor selvagem e honestidade brutal. Seja hilariamente cruel mas tecnicamente preciso. Sarcasmo pesado, humor ácido, emojis. Responda em português.",
    };

    if (aiContext.session) {
        try { await aiContext.session.destroy(); } catch (e) { }
        aiContext.session = null;
    }

    const personality = systemPrompts[mode]
    const finalPrompt = `Instrução de Personalidade: ${personality}\n\nCódigo para analisar:\n${question}`;

    aiContext.session = await window.LanguageModel.create({
        expectedInputLanguages: ["pt"],
        systemPrompt: systemPrompts[mode]
    });

    const responseStream = await aiContext.session.promptStreaming(finalPrompt);
    for await (const chunk of responseStream) {
        yield chunk
    }

}

async function init() {

    setupEventListeners()

    const availability = await window.LanguageModel.availability()
    console.log("API status: " + availability)

    if (availability !== "available") {
        if (elements.error) {
            elements.error.textContent = "API LanguageModel not available.";
            elements.error.classList.remove('hidden')
        }
    }
}

init();