const STORAGE_KEY = 'gutDiaryEntries';
const form = document.getElementById('entryForm');
const entriesEl = document.getElementById('entries');

function todayDefaults() {
  const now = new Date();
  document.getElementById('date').value = now.toISOString().slice(0, 10);
  document.getElementById('time').value = now.toTimeString().slice(0, 5);
}

function getEntries() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function value(id) { return document.getElementById(id).value; }
function checked(id) { return document.getElementById(id).checked; }

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const entry = {
    id: crypto.randomUUID(),
    date: value('date'),
    time: value('time'),
    food: value('food'),
    bloating: value('bloating'),
    nausea: value('nausea'),
    cramps: value('cramps'),
    distension: value('distension'),
    burping: value('burping'),
    hadBm: checked('hadBm'),
    bmSize: value('bmSize'),
    bmConsistency: value('bmConsistency'),
    bmComplete: value('bmComplete'),
    notes: value('notes')
  };
  const entries = getEntries();
  entries.unshift(entry);
  saveEntries(entries);
  form.reset();
  todayDefaults();
  render();
});

function render() {
  const entries = getEntries();
  if (!entries.length) {
    entriesEl.innerHTML = '<p class="small">No entries yet.</p>';
    return;
  }
  entriesEl.innerHTML = entries.map(entry => `
    <article class="entry">
      <h3>${escapeHtml(entry.date)} at ${escapeHtml(entry.time)}</h3>
      <p><strong>Food/drink:</strong> ${escapeHtml(entry.food || '—')}</p>
      <p><strong>Scores:</strong> bloating ${entry.bloating}/10, nausea ${entry.nausea}/10, cramps ${entry.cramps}/10</p>
      <p><strong>Distension:</strong> ${escapeHtml(entry.distension)} · <strong>Burping:</strong> ${escapeHtml(entry.burping)}</p>
      <p><strong>BM:</strong> ${entry.hadBm ? `${escapeHtml(entry.bmSize || '—')}, ${escapeHtml(entry.bmConsistency || '—')}, complete: ${escapeHtml(entry.bmComplete || '—')}` : 'No'}</p>
      <p><strong>Notes:</strong> ${escapeHtml(entry.notes || '—')}</p>
      <button class="delete" onclick="deleteEntry('${entry.id}')">Delete</button>
    </article>`).join('');
}

function deleteEntry(id) {
  saveEntries(getEntries().filter(entry => entry.id !== id));
  render();
}

function escapeHtml(str) {
  return String(str).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function download(filename, text, type) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

document.getElementById('exportJson').addEventListener('click', () => {
  download('gut-diary.json', JSON.stringify(getEntries(), null, 2), 'application/json');
});

document.getElementById('exportCsv').addEventListener('click', () => {
  const entries = getEntries();
  const headers = ['date','time','food','bloating','nausea','cramps','distension','burping','hadBm','bmSize','bmConsistency','bmComplete','notes'];
  const rows = entries.map(entry => headers.map(h => `"${String(entry[h] ?? '').replace(/"/g, '""')}"`).join(','));
  download('gut-diary.csv', [headers.join(','), ...rows].join('\n'), 'text/csv');
});

document.getElementById('clearAll').addEventListener('click', () => {
  if (confirm('Clear all diary entries from this browser?')) {
    localStorage.removeItem(STORAGE_KEY);
    render();
  }
});

todayDefaults();
render();
