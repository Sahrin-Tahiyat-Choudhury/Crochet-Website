async function loadAbout() {

  const about =
    await API.content.getAbout();

  if (!about) return;

  document.getElementById('aboutTitle').value =
    about.title || '';

  document.getElementById('aboutDescription').value =
    about.description || '';
}


async function saveAbout() {

  await API.content.updateAbout({
    title:
      document.getElementById('aboutTitle').value,

    description:
      document.getElementById('aboutDescription').value
  });

  alert('Saved');
}

function addFaq(question = '', answer = '') {
    const container = document.getElementById('faqContainer');

    const row = document.createElement('div');

    row.className = 'faq-row';

    row.innerHTML = `
        <div class="form-group"> <label class="form-label">Question</label>
        <input class="form-input question" value="${question}" > </div>

        <div class="form-group"> <label class="form-label">Answer</label>
        <textarea class="form-textarea answer" >${answer}</textarea> </div>

        <div class="faq-actions"> <button type="button" class="btn btn-danger btn-sm" onclick="this.closest('.faq-row').remove()" > Remove </button>
        </div>
    `;

    container.appendChild(row);
}

async function saveFaqs() {

  const faqItems = [];

  document
    .querySelectorAll('.faq-row')
    .forEach(row => {

      faqItems.push({
        question:
          row.querySelector('.question').value,

        answer:
          row.querySelector('.answer').value
      });

    });

  await API.content.updateFaq({
    faqItems
  });

  alert('Saved');
}