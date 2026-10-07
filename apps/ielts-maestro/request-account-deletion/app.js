(function () {
  const form = document.getElementById('deletion-form');
  const statusBox = document.getElementById('statusBox');
  const year = document.getElementById('year');

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  if (!form || !statusBox) {
    return;
  }

  const apiBaseUrl = (window.APP_CONFIG && window.APP_CONFIG.API_URL
    ? String(window.APP_CONFIG.API_URL)
    : ''
  ).replace(/\/$/, '');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    if (!apiBaseUrl) {
      statusBox.className = 'status-box error';
      statusBox.textContent = 'API URL is not configured. Set window.APP_CONFIG.API_URL in config.js.';
      return;
    }

    const formData = new FormData(form);
    const payload = Object.fromEntries(formData.entries());

    statusBox.className = 'status-box';
    statusBox.textContent = 'Submitting your request...';

    try {
      const response = await fetch(`${apiBaseUrl}/account-deletion/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.message || 'Unable to submit your request right now.');
      }

      statusBox.className = 'status-box success';
      statusBox.textContent = result.message || 'Your request was submitted successfully.';
      form.reset();
    } catch (error) {
      statusBox.className = 'status-box error';
      statusBox.textContent =
        (error && error.message) || 'Unable to submit your request right now.';
    }
  });
})();
