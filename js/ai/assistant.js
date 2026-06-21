/**
 * assistant.js — GreenBytes Guide AI Chat Component
 * Project ByteSaver
 *
 * Persona: GreenBytes Guide 🌿
 * - Context-aware: detects OS intent, asks follow-up, gives device-specific steps
 * - All user inputs sanitised via textContent (no innerHTML on user data)
 * - API key stored in sessionStorage only (never in source)
 * - Conversation history limited to last 5 turns (token efficiency)
 */

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

const SYSTEM_PROMPT = `You are GreenBytes Guide 🌿, an expert AI assistant for Project ByteSaver — a platform dedicated to reducing digital carbon footprints.

Your personality is:
- Warm, encouraging, and passionate about sustainability
- Concise but thorough — never waffle
- Data-driven: cite specific numbers when relevant
- Emoji-friendly but not excessive (1–2 per response max)

Your core knowledge:
- 1 GB of stored data generates ~0.25 kg CO₂/year
- Average email = 4 g CO₂ (without attachment), up to 50 g with large attachment
- Data centers consume >1% of global electricity
- Streaming 1 hour of HD video ≈ 36 g CO₂
- Cloud backups are one of the biggest personal digital footprints
- Deleting junk mail, old photos, and unused app data makes a real difference

CRITICAL RULE — Platform-specific help:
If a user asks HOW to clear space, delete files, clear cache, clean up, or manage storage — you MUST first ask which platform they are using:
"Are you using iOS, Android, macOS, or Windows?"

Once they answer, provide exact, numbered UI steps specific to their device. For example:
- iOS: Settings → General → iPhone Storage → select app → Offload / Delete
- Android: Settings → Apps → [App] → Storage → Clear Cache
- macOS: Apple Menu → About This Mac → Storage → Manage → Recommendations
- Windows: Settings → System → Storage → Storage Sense / Cleanup recommendations

Always end your response with one actionable tip or encouragement related to Project ByteSaver.`;

let history = []; // {role, text}[]

/**
 * Mounts the AI chat panel and FAB.
 * @param {object} els - { fab, panel, messagesEl, inputEl, sendBtn }
 */
export function mountAssistant(els) {
  const { fab, panel, messagesEl, inputEl, sendBtn } = els;
  if (!fab || !panel) {return;}

  // Open/close FAB
  fab.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    fab.classList.toggle('open', open);
    fab.setAttribute('aria-expanded', String(open));
    if (open) {
      inputEl?.focus();
      if (messagesEl && messagesEl.children.length === 0) {
        appendBotMessage(messagesEl, getGreeting());
      }
    }
  });

  // Send on button click
  sendBtn?.addEventListener('click', () => handleSend(els));

  // Send on Enter (Shift+Enter for newline)
  inputEl?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(els);
    }
  });

  // Auto-resize textarea
  inputEl?.addEventListener('input', () => {
    inputEl.style.height = 'auto';
    inputEl.style.height = `${Math.min(inputEl.scrollHeight, 80)}px`;
  });
}

async function handleSend(els) {
  const { messagesEl, inputEl, sendBtn } = els;
  const rawText = inputEl.value.trim();
  if (!rawText) {return;}

  // Sanitize: use textContent only, never innerHTML for user content
  const safeText = rawText.slice(0, 1000); // hard cap

  inputEl.value = '';
  inputEl.style.height = 'auto';

  // Render user message
  appendUserMessage(messagesEl, safeText);

  // Check for API key
  const apiKey = sessionStorage.getItem('bytesaver_api_key');
  if (!apiKey) {
    appendBotMessage(messagesEl,
      '🔑 I need a Gemini API key to respond. Please open ⚙️ Settings (top-right) and paste your key. It\'s stored only in your browser session and never shared.');
    return;
  }

  // Show typing indicator
  const typingEl = showTyping(messagesEl);
  sendBtn.disabled = true;

  try {
    history.push({ role: 'user', text: safeText });
    const reply = await callGemini(apiKey, safeText);
    history.push({ role: 'model', text: reply });

    // Trim history to last 5 turns (10 messages)
    if (history.length > 10) {history = history.slice(history.length - 10);}

    typingEl.remove();
    appendBotMessage(messagesEl, reply);
  } catch (err) {
    typingEl.remove();
    appendBotMessage(messagesEl, getErrorMessage(err));
  } finally {
    sendBtn.disabled = false;
    inputEl.focus();
  }
}

async function callGemini(apiKey, userText) {
  // Build contents array from history
  const contents = history.slice(0, -1).map((msg) => ({
    role: msg.role,
    parts: [{ text: msg.text }],
  }));

  // Add current user message
  contents.push({ role: 'user', parts: [{ text: userText }] });

  const body = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 512,
      topP: 0.9,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT',        threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH',       threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  };

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const msg = err?.error?.message || `API error ${res.status}`;
    if (res.status === 400) {throw new Error(`Invalid API key or request. ${  msg}`);}
    if (res.status === 429) {throw new Error('Rate limit reached. Please wait a moment and try again.');}
    throw new Error(msg);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    // Check for safety block
    const reason = data?.candidates?.[0]?.finishReason;
    if (reason === 'SAFETY') {throw new Error('Response blocked by safety filters.');}
    throw new Error('Empty response from AI. Please try rephrasing.');
  }

  return text.trim();
}

/** Renders a bot message bubble (Markdown-lite formatting). */
function appendBotMessage(container, text) {
  const wrap = document.createElement('div');
  wrap.className = 'msg msg-bot';
  wrap.setAttribute('role', 'log');

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';

  // Safe markdown-lite: bold **text**, inline code `code`, line breaks
  bubble.innerHTML = formatBotText(text);

  wrap.appendChild(bubble);
  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
}

/** Renders a user message bubble (plain text only — safe). */
function appendUserMessage(container, text) {
  const wrap = document.createElement('div');
  wrap.className = 'msg msg-user';
  wrap.setAttribute('aria-label', `You: ${  text.slice(0, 50)}`);

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text; // safe: textContent only

  wrap.appendChild(bubble);
  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
}

/** Shows animated typing indicator, returns the element. */
function showTyping(container) {
  const wrap = document.createElement('div');
  wrap.className = 'msg msg-bot';
  wrap.setAttribute('aria-label', 'GreenBytes Guide is typing');
  wrap.setAttribute('aria-live', 'polite');

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble typing-indicator';
  bubble.innerHTML = `
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>
    <div class="typing-dot"></div>`;

  wrap.appendChild(bubble);
  container.appendChild(wrap);
  container.scrollTop = container.scrollHeight;
  return wrap;
}

/**
 * Minimal safe markdown-lite formatter for bot responses.
 * Only processes known safe patterns — no innerHTML on user input.
 */
function formatBotText(text) {
  // Escape HTML first
  const el = document.createElement('div');
  el.textContent = text;
  let safe = el.innerHTML;

  // Bold: **text**
  safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  // Inline code: `code`
  safe = safe.replace(/`([^`]+)`/g,
    '<code style="background:rgba(0,230,118,0.1);padding:1px 4px;border-radius:3px;font-family:var(--font-mono);font-size:0.85em">$1</code>');
  // Numbered list items
  safe = safe.replace(/^(\d+)\. (.+)$/gm, '<div style="margin:4px 0"><strong>$1.</strong> $2</div>');
  // Line breaks
  safe = safe.replace(/\n/g, '<br/>');

  return safe;
}

function getGreeting() {
  const greetings = [
    '🌿 Hey! I\'m **GreenBytes Guide**. Ask me anything about reducing your digital carbon footprint — or say "How do I clear space?" for step-by-step device help!',
    '👋 Welcome to ByteSaver! I\'m **GreenBytes Guide**. Did you know the average person has 3× more data stored than they actively use? Let\'s fix that. What can I help you with?',
    '🌍 Hi there! Every GB you delete saves ~250g of CO₂ per year. I\'m **GreenBytes Guide** — your personal digital sustainability expert. How can I help?',
  ];
  return greetings[Math.floor(Math.random() * greetings.length)];
}

function getErrorMessage(err) {
  const msg = err?.message || 'Unknown error';
  if (msg.includes('rate limit') || msg.includes('429')) {
    return '⏳ You\'ve hit the rate limit. Please wait 30 seconds and try again.';
  }
  if (msg.includes('API key') || msg.includes('400')) {
    return '🔑 Your API key may be invalid. Please check it in ⚙️ Settings.';
  }
  if (msg.includes('fetch') || msg.includes('network') || msg.includes('Failed')) {
    return '📡 Network error. Please check your internet connection and try again.';
  }
  return `⚠️ Something went wrong: ${msg.slice(0, 100)}`;
}
