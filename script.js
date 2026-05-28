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
            toggleSendOrStopButton(false)
            return;
        }

        await onSubmitQuestion();
    });
}

async function onSubmitQuestion() {
    const question = elements.questionInput.value.trim();

    if (!question) return;

    const radioSelected = document.querySelector('input[name="mode"]:checked')?.value

    try {
        toggleSendOrStopButton(true)

        elements.output.classList.remove('hidden');
        elements.output.innerHTML = '<div class="spinner"></div> Processing your code...';
        elements.error.classList.add('hidden');

        
        const aiResponseChunks = askAI(question);

   
        elements.output.textContent = '';

        for await (const chunk of aiResponseChunks) {
            if (aiContext.abortController?.signal.aborted) {
                break;
            }

            elements.output.textContent += chunk;
        }

    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('AI generation error:', error);
            elements.output.textContent = 'Error generating response.';
        }
    } finally {
        toggleSendOrStopButton(false);
    }
}

function toggleSendOrStopButton(isGenerating) {
    if (isGenerating) {
        aiContext.isGenerating = isGenerating;
        elements.button.textContent = 'Stop';
        elements.button.classList.add('stop-button');
    } else {
        aiContext.abortController?.abort();
        aiContext.isGenerating = isGenerating;
        elements.button.textContent = 'Analyze';
        elements.button.classList.remove('stop-button');
    }
}

async function* askAI(question, temperature = 0.7, topK = 3) {
    aiContext.abortController?.abort();
    aiContext.abortController = new AbortController();

    elements.output.classList.remove('hidden');

    // Destroy previous session and create new one with updated parameters
    if (aiContext.session) {
        aiContext.session.destroy();
        aiContext.session = null;
    }

    aiContext.session = await LanguageModel.create({
        expectedInputLanguages: ["pt"],
        temperature,
        topK,
        initialPrompts: [
            {
                role: 'system', content: 'Você é um assistente de IA que responde de forma clara e objetiva. Responda sempre em formato de texto ao invés de markdown'
            },
        ],
    });

    const responseStream = await aiContext.session.promptStreaming(
        [
            {
                role: 'user',
                content: question,
            },
        ],
        {
            signal: aiContext.abortController.signal,
        }
    );

    try {
        for await (const chunk of responseStream) {
            if (aiContext.abortController.signal.aborted) {
                break;
            }
            console.log('chunk:', chunk);
            yield chunk;
        }
    } finally {
        aiContext.session?.destroy();
        aiContext.session = null;
    }
}

(async function main() {

    if (!window.LanguageModel) {
        elements.output.textContent = "API LanguageModel not available.";
        return;
    }

    try {
        return setupEventListeners()

    } catch (err) {
        console.error(err);
        elements.output.innerHTML = err.message;
    }

})();