(function () {
  let chatHistory = [];
  let isOpen = false;

  // ── Build DOM ──────────────────────────────────────────────
  const bubble = document.createElement('div');
  bubble.id = 'ai-bubble';
  bubble.title = 'Ask AI Assistant';
  bubble.innerHTML = '🤖';

  const panel = document.createElement('div');
  panel.id = 'ai-panel';
  panel.innerHTML = `
    <div id="ai-header">
      <span>🤖 AI Retail Assistant</span>
      <button id="ai-close">✕</button>
    </div>
    <div id="ai-messages"></div>
    <div id="ai-suggestions">
      <button class="ai-chip" data-q="What are my top selling products?">Top sellers</button>
      <button class="ai-chip" data-q="Which items are low on stock?">Low stock</button>
      <button class="ai-chip" data-q="Summarize today's sales">Today's sales</button>
      <button class="ai-chip" data-q="What is the total revenue?">Revenue</button>
    </div>
    <div id="ai-input-row">
      <input id="ai-input" type="text" placeholder="Ask anything about your store…" autocomplete="off"/>
      <button id="ai-send">Send</button>
    </div>
  `;

  document.body.appendChild(bubble);
  document.body.appendChild(panel);
  injectStyles();

  // ── Events ─────────────────────────────────────────────────
  bubble.addEventListener('click', togglePanel);
  document.getElementById('ai-close').addEventListener('click', togglePanel);
  document.getElementById('ai-send').addEventListener('click', sendMessage);
  document.getElementById('ai-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });
  document.querySelectorAll('.ai-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('ai-input').value = btn.dataset.q;
      sendMessage();
    });
  });

  function togglePanel() {
    isOpen = !isOpen;
    panel.style.display = isOpen ? 'flex' : 'none';
    if (isOpen && document.getElementById('ai-messages').children.length === 0) {
      appendMessage('assistant', 'Hi! I\'m your AI retail assistant. Ask me about sales, stock, revenue, or top products.');
    }
  }

  async function sendMessage() {
    const input = document.getElementById('ai-input');
    const question = input.value.trim();
    if (!question) return;

    input.value = '';
    appendMessage('user', question);
    const typingId = appendMessage('assistant', '…', true);

    try {
      const data = await fetchAPI('/api/ai/query', {
        method: 'POST',
        body: JSON.stringify({ question, history: chatHistory }),
      });

      removeMessage(typingId);

      if (data && data.answer) {
        appendMessage('assistant', data.answer);
        chatHistory.push({ role: 'user', text: question });
        chatHistory.push({ role: 'model', text: data.answer });
        // Keep history to last 10 turns
        if (chatHistory.length > 20) chatHistory = chatHistory.slice(-20);
      } else {
        appendMessage('assistant', data?.error || 'Something went wrong. Please try again.');
      }
    } catch (err) {
      removeMessage(typingId);
      appendMessage('assistant', 'Network error. Make sure the server is running.');
    }
  }

  function appendMessage(role, text, isTyping = false) {
    const msgs = document.getElementById('ai-messages');
    const div = document.createElement('div');
    const id = 'msg-' + Date.now() + Math.random();
    div.id = id;
    div.className = 'ai-msg ' + (role === 'user' ? 'ai-msg-user' : 'ai-msg-bot');
    div.textContent = text;
    if (isTyping) div.classList.add('ai-typing');
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return id;
  }

  function removeMessage(id) {
    const el = document.getElementById(id);
    if (el) el.remove();
  }

  // ── Styles ─────────────────────────────────────────────────
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #ai-bubble {
        position: fixed; bottom: 28px; right: 28px;
        width: 56px; height: 56px; border-radius: 50%;
        background: #3498db; color: #fff;
        font-size: 26px; display: flex; align-items: center;
        justify-content: center; cursor: pointer;
        box-shadow: 0 4px 14px rgba(0,0,0,0.25);
        z-index: 9999; user-select: none;
        transition: transform .2s;
      }
      #ai-bubble:hover { transform: scale(1.1); }

      #ai-panel {
        display: none; flex-direction: column;
        position: fixed; bottom: 96px; right: 28px;
        width: 360px; height: 520px;
        background: #fff; border-radius: 14px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.18);
        z-index: 9998; overflow: hidden;
        font-family: 'Segoe UI', sans-serif;
      }

      #ai-header {
        background: #2c3e50; color: #fff;
        padding: 14px 16px; display: flex;
        justify-content: space-between; align-items: center;
        font-weight: 600; font-size: 15px;
      }
      #ai-close {
        background: none; border: none; color: #fff;
        font-size: 18px; cursor: pointer; padding: 0;
      }

      #ai-messages {
        flex: 1; overflow-y: auto; padding: 14px;
        display: flex; flex-direction: column; gap: 10px;
        background: #f5f6fa;
      }

      .ai-msg {
        max-width: 82%; padding: 10px 14px;
        border-radius: 14px; font-size: 14px;
        line-height: 1.5; word-wrap: break-word;
      }
      .ai-msg-user {
        background: #3498db; color: #fff;
        align-self: flex-end; border-bottom-right-radius: 4px;
      }
      .ai-msg-bot {
        background: #fff; color: #2c3e50;
        align-self: flex-start; border-bottom-left-radius: 4px;
        box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      }
      .ai-typing { opacity: .6; font-style: italic; }

      #ai-suggestions {
        padding: 8px 12px; display: flex; flex-wrap: wrap;
        gap: 6px; background: #fff; border-top: 1px solid #eee;
      }
      .ai-chip {
        background: #ecf0f1; border: none; border-radius: 20px;
        padding: 5px 12px; font-size: 12px; cursor: pointer;
        color: #2c3e50; transition: background .2s;
      }
      .ai-chip:hover { background: #3498db; color: #fff; }

      #ai-input-row {
        display: flex; padding: 10px 12px; gap: 8px;
        border-top: 1px solid #eee; background: #fff;
      }
      #ai-input {
        flex: 1; padding: 9px 12px; border: 1px solid #ddd;
        border-radius: 20px; font-size: 14px; outline: none;
        margin: 0;
      }
      #ai-input:focus { border-color: #3498db; }
      #ai-send {
        background: #3498db; color: #fff; border: none;
        border-radius: 20px; padding: 9px 18px;
        font-size: 14px; cursor: pointer;
      }
      #ai-send:hover { background: #2980b9; }
    `;
    document.head.appendChild(style);
  }
})();
