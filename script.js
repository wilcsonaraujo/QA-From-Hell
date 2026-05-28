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

    const mode = document.querySelector('input[name="mode"]:checked')?.value || 'chaos';

    try {
        toggleSendOrStopButton(true)

        elements.output.classList.remove('hidden');
        elements.output.innerHTML = '<div class="spinner"></div> Processing your code...';
        elements.error.classList.add('hidden');


        const aiResponseChunks = askAI(question, mode);

   
        let fullResponse = '';

        for await (const chunk of aiResponseChunks) {
            if (aiContext.abortController?.signal.aborted) break;
            fullResponse = chunk;
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

    const aiApi = window.ai;
    if (!aiApi || !aiApi.languageModel) {
        throw new Error("AI API not available.");
    }

    const systemPrompts = {
        'gentle': 'Você é um revisor de código extremamente carinhoso e construtivo. Use emojis fofos e incentive o programador.',
        'senior-qa': 'Você é um QA Senior meticuloso. Foque em bugs, edge cases e boas práticas de forma profissional.',
        'chaos': 'Você é o Chaos Engineer. Seja sarcástico, impiedoso e destrua o código com críticas ácidas e humor negro.'
    };

    if (aiContext.session) {
        try { await aiContext.session.destroy(); } catch (e) {}
        aiContext.session = null;
    }

    aiContext.session = await window.ai.languageModel.create({
        systemPrompt: systemPrompts[mode] || systemPrompts['chaos']
    });

    const responseStream = await aiContext.session.promptStreaming(
        question,
        {
            signal: aiContext.abortController.signal,
        }
    );

    for await (const chunk of responseStream){
        yield chunk;
    }

    if (aiContext.session) {
        try { await aiContext.session.destroy(); } catch (e) {}
        aiContext.session = null;
    }
}

function init() {

    setupEventListeners()

    const hasAi = typeof window.ai !== 'undefined' && window.ai !== null && typeof window.ai.languageModel !== 'undefined';

    if (!hasAi) {
        if (elements.error) {
            elements.error.textContent = "API LanguageModel not available.";
            elements.error.classList.remove('hidden')
        }
    }
}

init();