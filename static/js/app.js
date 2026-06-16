document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refresh-btn');
    const notesContainer = document.getElementById('notes-container');
    const loadingState = document.getElementById('loading-state');
    const errorMessage = document.getElementById('error-message');
    const btnText = refreshBtn.querySelector('.btn-text');
    const spinner = refreshBtn.querySelector('.spinner');

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/notes');
            const result = await response.json();

            if (result.status === 'success') {
                renderNotes(result.data);
            } else {
                showError(result.message || 'Failed to fetch release notes.');
            }
        } catch (error) {
            showError('A network error occurred while fetching notes.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const setLoading = (isLoading) => {
        if (isLoading) {
            refreshBtn.disabled = true;
            spinner.classList.remove('hidden');
            if (notesContainer.children.length === 0) {
                loadingState.classList.remove('hidden');
            }
            errorMessage.classList.add('hidden');
        } else {
            refreshBtn.disabled = false;
            spinner.classList.add('hidden');
            loadingState.classList.add('hidden');
        }
    };

    const showError = (message) => {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
    };

    const stripHtml = (html) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    const renderNotes = (notes) => {
        notesContainer.innerHTML = '';
        
        if (notes.length === 0) {
            notesContainer.innerHTML = '<p class="loading-state">No release notes found.</p>';
            return;
        }

        notes.forEach(note => {
            const date = new Date(note.published);
            const formattedDate = date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            // Prepare tweet text
            const cleanTitle = stripHtml(note.title);
            const cleanContent = stripHtml(note.content).substring(0, 100) + '...';
            const tweetText = `BigQuery Update: ${cleanTitle}\n\n${cleanContent}\n\nRead more: ${note.link}`;
            const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;

            const card = document.createElement('div');
            card.className = 'note-card';
            
            // Twitter SVG path
            const twitterPath = "M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z";

            card.innerHTML = `
                <div class="note-header">
                    <div class="note-date">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ${formattedDate}
                    </div>
                    <h2 class="note-title"><a href="${note.link}" target="_blank" rel="noopener noreferrer">${note.title}</a></h2>
                </div>
                <div class="note-content">
                    ${note.content}
                </div>
                <div class="note-actions">
                    <a href="${tweetUrl}" target="_blank" rel="noopener noreferrer" class="tweet-btn" title="Tweet this update">
                        <svg class="tweet-icon" viewBox="0 0 24 24"><path d="${twitterPath}"></path></svg>
                        Tweet Update
                    </a>
                </div>
            `;
            notesContainer.appendChild(card);
        });
    };

    refreshBtn.addEventListener('click', fetchNotes);

    // Initial fetch
    fetchNotes();
});
