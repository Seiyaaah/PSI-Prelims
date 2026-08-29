export async function renderNotes(container, subjectId = null) {
  try {
    const res = await fetch('data/notes.json?v=' + Date.now());
    const notesData = await res.json();

    // SCENARIO 1: A specific subject ID was clicked (Show Detail Page)
    if (subjectId) {
      const note = Array.isArray(notesData) 
        ? notesData.find(n => n.id === subjectId) 
        : notesData[subjectId];

      if (!note) {
        container.innerHTML = `
          <div class="card">
            <h2>Notes Not Found</h2>
            <p>No detailed notes available for this topic.</p>
            <button onclick="window.location.hash='#notes'">← Back to Notes</button>
          </div>
        `;
        return;
      }

      // Build HTML from the new 'sections' array structure
      let bodyHtml = '';
      if (note.sections && Array.isArray(note.sections)) {
        bodyHtml = note.sections.map(sec => `
          <div style="margin-bottom: 2rem;">
            <h2>${sec.heading || ''}</h2>
            ${sec.paragraphs ? sec.paragraphs.map(p => `<p style="margin-bottom: 1rem; line-height: 1.6;">${p}</p>`).join('') : ''}
            ${sec.list ? `<ul style="margin-top: 0.5rem; margin-bottom: 1rem; padding-left: 1.5rem; display: grid; gap: 0.5rem;">${sec.list.map(item => `<li>${item}</li>`).join('')}</ul>` : ''}
          </div>
        `).join('');
      } else {
        // Fallback just in case an older note uses the old 'content' string format
        bodyHtml = note.content || note.summary || '';
      }

      container.innerHTML = `
        <div class="card" style="max-width: 800px; margin: 0 auto; padding: 2rem;">
          <button onclick="window.location.hash='#notes'" style="margin-bottom: 1.5rem; background: var(--text-muted); color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">← Back to Notes List</button>
          
          <h1 style="margin-bottom: 1rem; font-size: 2rem;">${note.title || ''}</h1>
          <p style="color: var(--text-muted); font-size: 1.1rem; margin-bottom: 1.5rem;">${note.summary || ''}</p>
          <hr style="border: 0; border-top: 1px solid var(--border-color); margin: 1.5rem 0;">
          
          <div class="notes-body" style="line-height: 1.6; font-size: 1.1rem; margin-top: 1rem;">
            ${bodyHtml}
          </div>

          <div style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
            <button onclick="window.location.hash='#quiz/${subjectId}'" style="background: var(--primary-color); color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: bold;">Take Quiz for this Topic →</button>
          </div>
        </div>
      `;
      return;
    }

    // SCENARIO 2: Show the main list of note cards
    const notesArray = Array.isArray(notesData) 
      ? notesData 
      : Object.keys(notesData).map(key => ({ id: key, ...notesData[key] }));

    container.innerHTML = `
      <h2>Quick Revision Notes</h2>
      <div style="margin-top: 1.0rem; display: grid; gap: 1rem;">
        ${notesArray.map(note => `
          <div class="card note-card" data-id="${note.id}" style="cursor: pointer; transition: transform 0.2s;">
            <h3>${note.title || 'Untitled'}</h3>
            <p style="margin-top: 0.5rem; color: var(--text-muted);">${note.summary || note.description || ''}</p>
            <span style="display: inline-block; margin-top: 0.75rem; color: var(--primary-color); font-weight: bold; font-size: 0.9rem;">Read Full Notes →</span>
          </div>
        `).join('')}
      </div>
    `;

    // Add click listeners to each card to trigger the detail page view
    container.querySelectorAll('.note-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        window.location.hash = `#notes/${id}`;
      });
    });

  } catch (err) {
    console.error('Notes loading error:', err);
    container.innerHTML = '<div class="card"><p style="color: red;">Failed to load notes.</p></div>';
  }
}
