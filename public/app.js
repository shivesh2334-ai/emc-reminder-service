const form = document.querySelector('#reminder-form');
const list = document.querySelector('#reminder-list');
const count = document.querySelector('#reminder-count');
const formMessage = document.querySelector('#form-message');
const submitButton = document.querySelector('#submit-button');
const refreshButton = document.querySelector('#refresh-button');
const messageField = document.querySelector('#message');
const messageCount = document.querySelector('#message-count');
const recipientField = document.querySelector('#recipient');
const recipientHint = document.querySelector('#recipient-hint');
const scheduledField = document.querySelector('#scheduledAt');
const statusElement = document.querySelector('#service-status');

let defaults = { whatsapp: '9891368298', email: 'support@emc.ooo' };

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function selectedChannel() {
  return form.elements.type.value;
}

function setMinimumDate() {
  const date = new Date(Date.now() + 5 * 60 * 1000);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  scheduledField.min = local;
  if (!scheduledField.value) scheduledField.value = local;
}

function updateRecipient() {
  const type = selectedChannel();
  if (type === 'WHATSAPP') {
    recipientField.value = defaults.whatsapp;
    recipientField.placeholder = 'WhatsApp number';
    recipientHint.textContent = 'Default WhatsApp number';
  } else if (type === 'EMAIL') {
    recipientField.value = defaults.email;
    recipientField.placeholder = 'Email address';
    recipientHint.textContent = 'Default service email';
  } else {
    recipientField.value = '';
    recipientField.placeholder = type === 'SMS' ? 'Mobile number' : 'Device or user ID';
    recipientHint.textContent = 'A recipient is required for this channel';
  }
}

function showMessage(text, type) {
  formMessage.textContent = text;
  formMessage.className = `form-message ${type}`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}

function renderReminders(reminders) {
  count.textContent = String(reminders.length);
  if (!reminders.length) {
    list.innerHTML = `
      <div class="empty-state">
        <span class="empty-icon" aria-hidden="true">✓</span>
        <h3>No reminders yet</h3>
        <p>Create a reminder and it will appear here.</p>
      </div>`;
    return;
  }

  list.innerHTML = reminders
    .sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt))
    .map((reminder) => `
      <article class="reminder-card" data-id="${escapeHtml(reminder.id)}">
        <div class="reminder-card-top">
          <div>
            <h3>${escapeHtml(reminder.title)}</h3>
            <p>${escapeHtml(reminder.message)}</p>
          </div>
          <span class="status-badge ${escapeHtml(reminder.status)}">${escapeHtml(reminder.status)}</span>
        </div>
        <div class="reminder-meta">
          <span>${escapeHtml(reminder.type)}</span>
          <span>${escapeHtml(reminder.recipient)}</span>
          <span>${escapeHtml(formatDate(reminder.scheduledAt))}</span>
        </div>
        <div class="reminder-actions">
          ${reminder.status === 'PENDING' ? `<button class="action-button" type="button" data-action="cancel">Cancel</button>` : ''}
          <button class="action-button danger" type="button" data-action="delete">Delete</button>
        </div>
      </article>`)
    .join('');
}

async function loadDefaults() {
  try {
    const response = await fetch('/reminders/config/defaults');
    if (!response.ok) throw new Error('Defaults unavailable');
    const payload = await response.json();
    defaults = payload.data;
  } catch (_) {
    // Safe application defaults remain available when configuration cannot be loaded.
  }
  updateRecipient();
}

async function loadReminders() {
  refreshButton.disabled = true;
  try {
    const response = await fetch('/reminders');
    if (!response.ok) throw new Error('Unable to load reminders');
    const payload = await response.json();
    renderReminders(payload.data || []);
  } catch (error) {
    list.innerHTML = `<div class="empty-state"><h3>Could not load reminders</h3><p>${escapeHtml(error.message)}</p></div>`;
  } finally {
    refreshButton.disabled = false;
  }
}

async function checkHealth() {
  try {
    const response = await fetch('/health');
    if (!response.ok) throw new Error();
    statusElement.classList.add('online');
    statusElement.querySelector('span:last-child').textContent = 'Service online';
  } catch (_) {
    statusElement.classList.add('offline');
    statusElement.querySelector('span:last-child').textContent = 'Service unavailable';
  }
}

form.addEventListener('change', (event) => {
  if (event.target.name === 'type') updateRecipient();
});

messageField.addEventListener('input', () => {
  messageCount.textContent = String(messageField.value.length);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  submitButton.disabled = true;
  submitButton.textContent = 'Scheduling…';
  formMessage.className = 'form-message';

  const body = {
    title: form.elements.title.value.trim(),
    message: form.elements.message.value.trim(),
    scheduledAt: new Date(form.elements.scheduledAt.value).toISOString(),
    type: selectedChannel(),
    recipient: recipientField.value.trim() || undefined,
  };

  try {
    const response = await fetch('/reminders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.details?.join('. ') || payload.error || 'Unable to schedule reminder');

    showMessage('Reminder scheduled successfully.', 'success');
    form.elements.title.value = '';
    form.elements.message.value = '';
    messageCount.textContent = '0';
    setMinimumDate();
    await loadReminders();
  } catch (error) {
    showMessage(error.message, 'error');
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Schedule reminder';
  }
});

list.addEventListener('click', async (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;
  const card = button.closest('[data-id]');
  const id = card.dataset.id;
  button.disabled = true;

  try {
    const action = button.dataset.action;
    const response = await fetch(
      action === 'cancel' ? `/reminders/${encodeURIComponent(id)}/cancel` : `/reminders/${encodeURIComponent(id)}`,
      { method: action === 'cancel' ? 'POST' : 'DELETE' },
    );
    if (!response.ok) throw new Error(`Unable to ${action} reminder`);
    await loadReminders();
  } catch (error) {
    showMessage(error.message, 'error');
    button.disabled = false;
  }
});

refreshButton.addEventListener('click', loadReminders);

setMinimumDate();
Promise.all([checkHealth(), loadDefaults(), loadReminders()]);
