/* Floating chat widget.
 *
 * Talks only to the Worker in worker/ — no API key is present or possible here,
 * since this file is served publicly. The Dylan-only restriction is enforced
 * server-side in the system prompt; nothing is filtered in the browser, because
 * anyone can POST to the endpoint directly and skip whatever we did here.
 */
(function () {
  'use strict';

  var cfg = window.DYLAN_CHAT || {};
  if (!cfg.endpoint) return; // not configured — no button, no change to the page

  var esc = (window.DYLAN && window.DYLAN.esc) || function (s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  };

  var history = [];       // [{role, content}] — resent each turn; the API is stateless
  var busy = false;
  var panel, log, input, sendBtn, launcher;

  var GREETING =
    'Ask me about Bob Dylan — the records, the tours, the arguments. ' +
    'I only talk about Dylan and what surrounds him.';

  function build() {
    var wrap = document.createElement('div');
    wrap.className = 'chat-root';
    wrap.innerHTML =
      '<button class="chat-launcher" id="chat-launcher" aria-expanded="false"' +
        ' aria-controls="chat-panel" title="Ask about Bob Dylan">' +
        '<span class="chat-launcher-icon" aria-hidden="true">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"' +
          ' stroke-linecap="round" stroke-linejoin="round">' +
          '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.9 9.9 0 0 1-3.9-.8L3 21l1.9-4.6A8.3 8.3 0 0 1 3.6 11.5 8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z"/>' +
          '</svg></span>' +
        '<span class="chat-launcher-label">Ask about Dylan</span>' +
      '</button>' +
      '<section class="chat-panel" id="chat-panel" role="dialog"' +
        ' aria-label="Ask about Bob Dylan" hidden>' +
        '<header class="chat-head">' +
          '<div><strong>Ask about Dylan</strong>' +
          '<span class="chat-sub">Dylan topics only</span></div>' +
          '<button class="chat-close" aria-label="Close chat">&times;</button>' +
        '</header>' +
        '<div class="chat-log" id="chat-log" role="log" aria-live="polite"></div>' +
        '<form class="chat-form" id="chat-form">' +
          '<input id="chat-input" class="chat-input" type="text" autocomplete="off"' +
            ' placeholder="Why did they boo at Newport?" aria-label="Your question">' +
          '<button class="chat-send" id="chat-send" type="submit" aria-label="Send">&uarr;</button>' +
        '</form>' +
        '<p class="chat-foot">Answers come from Claude and can be wrong. ' +
          'Check anything that matters against the <a href="resources.html">sources</a>.</p>' +
      '</section>';
    document.body.appendChild(wrap);
    // lets the back-to-top button move up out of the launcher's way
    document.body.classList.add('has-chat');

    panel = wrap.querySelector('.chat-panel');
    log = wrap.querySelector('#chat-log');
    input = wrap.querySelector('#chat-input');
    sendBtn = wrap.querySelector('#chat-send');
    launcher = wrap.querySelector('#chat-launcher');

    launcher.addEventListener('click', toggle);
    wrap.querySelector('.chat-close').addEventListener('click', close);
    wrap.querySelector('#chat-form').addEventListener('submit', onSubmit);

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !panel.hidden) close();
    });

    addBubble('assistant', GREETING);
  }

  function toggle() { panel.hidden ? open() : close(); }

  function open() {
    panel.hidden = false;
    launcher.setAttribute('aria-expanded', 'true');
    launcher.classList.add('is-open');
    input.focus();
    log.scrollTop = log.scrollHeight;
  }

  function close() {
    panel.hidden = true;
    launcher.setAttribute('aria-expanded', 'false');
    launcher.classList.remove('is-open');
    launcher.focus();
  }

  function addBubble(role, text) {
    var el = document.createElement('div');
    el.className = 'chat-msg chat-' + role;
    el.innerHTML = '<div class="chat-bubble">' + esc(text) + '</div>';
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
    return el.querySelector('.chat-bubble');
  }

  function setBusy(state) {
    busy = state;
    input.disabled = state;
    sendBtn.disabled = state;
  }

  function onSubmit(e) {
    e.preventDefault();
    var text = input.value.trim();
    if (!text || busy) return;

    input.value = '';
    addBubble('user', text);
    history.push({ role: 'user', content: text });

    var bubble = addBubble('assistant', '');
    bubble.classList.add('is-thinking');
    bubble.innerHTML = '<span class="chat-dots"><i></i><i></i><i></i></span>';
    setBusy(true);

    send(bubble);
  }

  function send(bubble) {
    var answer = '';
    var started = false;

    fetch(cfg.endpoint, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ messages: history })
    }).then(function (res) {
      if (!res.ok || !res.body) {
        return res.json().catch(function () { return {}; }).then(function (j) {
          throw new Error(j.error || 'Could not reach the chat service.');
        });
      }

      var reader = res.body.getReader();
      var decoder = new TextDecoder();
      var buffer = '';

      function pump() {
        return reader.read().then(function (r) {
          if (r.done) return finish();
          buffer += decoder.decode(r.value, { stream: true });

          // SSE frames are separated by a blank line
          var frames = buffer.split('\n\n');
          buffer = frames.pop();

          frames.forEach(function (frame) {
            var line = frame.split('\n').find(function (l) { return l.indexOf('data:') === 0; });
            if (!line) return;
            var data;
            try { data = JSON.parse(line.slice(5).trim()); } catch (err) { return; }

            if (data.error) throw new Error(data.error);
            if (data.text) {
              if (!started) { started = true; bubble.classList.remove('is-thinking'); bubble.textContent = ''; }
              answer += data.text;
              bubble.textContent = answer;
              log.scrollTop = log.scrollHeight;
            }
          });
          return pump();
        });
      }
      return pump();
    }).catch(function (err) {
      // Drop the unanswered turn so a retry doesn't stack two user messages.
      if (history.length && history[history.length - 1].role === 'user') history.pop();
      bubble.classList.remove('is-thinking');
      bubble.classList.add('is-error');
      // fetch() rejects with a bare TypeError when the endpoint is unreachable,
      // and "Failed to fetch" means nothing to a reader.
      bubble.textContent = (err instanceof TypeError)
        ? "Couldn't reach the chat service. It may be offline — try again shortly."
        : (err.message || 'Something went wrong.');
      setBusy(false);
      input.focus();
    });

    function finish() {
      bubble.classList.remove('is-thinking');
      if (!answer) {
        bubble.classList.add('is-error');
        bubble.textContent = 'No answer came back. Try again?';
      } else {
        history.push({ role: 'assistant', content: answer });
      }
      setBusy(false);
      input.focus();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
