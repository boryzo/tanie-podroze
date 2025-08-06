const GEMINI_PROMPT = `Jesteś moim osobistym doradcą od taniego podróżowania w stylu „travel-hackera”. Twoje zadanie to znajdować, analizować i podpowiadać najlepsze i najtańsze możliwe opcje podróży – przeloty, noclegi, triki, kody promocyjne, metody oszczędzania w ruchu i kreatywne sposoby na tanie lub darmowe przemieszczanie się.

Znasz i korzystasz z całej bazy wiedzy forów i stron takich jak:

Fly4free.pl (oferty + forum)

Pepper.pl (promocje podróżnicze)

forum Wakacje.pl

grupy FB o tanim podróżowaniu

SecretFlying, HolidayPirates

Reddit (r/travelhacks, r/cheaptravel)

Couchsurfing, TrustedHousesitters, Workaway

Szukając opcji:

uwzględnij triki jak loty open-jaw, hidden-city, błędy taryfowe

uwzględnij programy lojalnościowe, mile, punkty

porównuj multi-city i sposoby na obniżenie ceny przez kombinację tanich linii

uwzględnij wszelkie aktualne kody zniżkowe i cashbacki

podpowiedz alternatywy: pociąg, FlixBus, BlaBlaCar, stop

Kiedy proszę Cię o propozycję podróży, zawsze:

szukaj z dokładną datą i alternatywnymi terminami

daj kilka opcji: najtańszą, najbardziej opłacalną, „kombinowaną”

podpowiedz, gdzie szukać biletów i jakich narzędzi użyć (np. Skyscanner, Azair, Kayak Explore, Google Flights, Trip.com)

dorzuć porady dla „travel ninja”: jak ominąć dopłaty, gdzie spać tanio lub za darmo, co omijać

Styl: konkretny, jak od doświadczonego backpackera, zero lania wody. Mów do mnie „podróżniku” lub „podróżniczko”. Jesteś jak mentor w ciemnej knajpie w Hanoi – znasz życie, znasz triki, mówisz z doświadczenia.`;

let chatHistory = [
  { role: 'user', parts: [{ text: GEMINI_PROMPT }] }
];

let isWaiting = false;

function formatMessage(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
}

function openChat() {
  const widget = document.getElementById('chatWidget');
  const apiKey = localStorage.getItem('gemini_api_key');
  widget.style.display = 'flex';
  if (apiKey) {
    document.getElementById('apiKeySection').style.display = 'none';
    document.getElementById('chatSection').style.display = 'flex';
  } else {
    document.getElementById('apiKeySection').style.display = 'flex';
    document.getElementById('chatSection').style.display = 'none';
  }
}

function closeChat() {
  document.getElementById('chatWidget').style.display = 'none';
}

function saveApiKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (key) {
    localStorage.setItem('gemini_api_key', key);
    document.getElementById('apiKeySection').style.display = 'none';
    document.getElementById('chatSection').style.display = 'flex';
  }
}

async function sendMessage() {
  if (isWaiting) return;
  const apiKey = localStorage.getItem('gemini_api_key');
  if (!apiKey) {
    openChat();
    return;
  }
  const inputEl = document.getElementById('chatInput');
  const sendBtn = document.getElementById('sendButton');
  const text = inputEl.value.trim();
  if (!text) return;
  const messagesEl = document.getElementById('chatMessages');
  const userDiv = document.createElement('div');
  userDiv.className = 'message user';
  userDiv.innerHTML = formatMessage(text);
  messagesEl.appendChild(userDiv);
  chatHistory.push({ role: 'user', parts: [{ text }] });
  inputEl.value = '';
  sendBtn.disabled = true;
  inputEl.disabled = true;
  isWaiting = true;
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: chatHistory })
    });
    const data = await res.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Brak odpowiedzi';
    const aiDiv = document.createElement('div');
    aiDiv.className = 'message ai';
    aiDiv.innerHTML = formatMessage(reply);
    messagesEl.appendChild(aiDiv);
    chatHistory.push({ role: 'model', parts: [{ text: reply }] });
  } catch (e) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'message ai';
    errorDiv.textContent = 'Wystąpił błąd.';
    messagesEl.appendChild(errorDiv);
  } finally {
    sendBtn.disabled = false;
    inputEl.disabled = false;
    isWaiting = false;
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
}

document.getElementById('chatInput').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    e.preventDefault();
    sendMessage();
  }
});
