document.addEventListener('DOMContentLoaded', () => {
    const refreshBtn = document.getElementById('refresh-btn');
    const exportCsvBtn = document.getElementById('export-csv-btn');
    const notesContainer = document.getElementById('notes-container');
    const loadingState = document.getElementById('loading-state');
    const errorMessage = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const retryBtn = document.getElementById('retry-btn');
    const spinner = refreshBtn.querySelector('.spinner');
    const toast = document.getElementById('toast');
    const themeToggleBtn = document.getElementById('theme-toggle');
    const searchInput = document.getElementById('search-input');
    const controlsBar = document.getElementById('controls-bar');
    const emptyState = document.getElementById('empty-state');
    const scrollToTopBtn = document.getElementById('scroll-to-top');

    let currentNotes = [];
    let filteredNotes = [];

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/notes');
            const result = await response.json();

            if (result.status === 'success') {
                currentNotes = result.data;
                filteredNotes = [...currentNotes];
                applySearch(); // In case there's text in the search box on refresh
                controlsBar.classList.remove('hidden');
            } else {
                showError(result.message || 'Failed to fetch release notes.');
            }
        } catch (error) {
            showError('A network error occurred while fetching notes. Please check your connection.');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const setLoading = (isLoading) => {
        if (isLoading) {
            refreshBtn.disabled = true;
            exportCsvBtn.disabled = true;
            searchInput.disabled = true;
            spinner.classList.remove('hidden');
            if (currentNotes.length === 0) {
                loadingState.classList.remove('hidden');
            }
            errorMessage.classList.add('hidden');
            emptyState.classList.add('hidden');
        } else {
            refreshBtn.disabled = false;
            exportCsvBtn.disabled = filteredNotes.length === 0;
            searchInput.disabled = false;
            spinner.classList.add('hidden');
            loadingState.classList.add('hidden');
        }
    };

    const showError = (message) => {
        errorText.textContent = message;
        errorMessage.classList.remove('hidden');
        controlsBar.classList.add('hidden');
        notesContainer.innerHTML = '';
        currentNotes = [];
        filteredNotes = [];
    };

    const stripHtml = (html) => {
        const tmp = document.createElement('DIV');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };

    // Advanced relative time formatting
    const getRelativeTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        const diffInDays = Math.floor(diffInSeconds / 86400);

        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    let toastTimeout;
    const showToast = (message) => {
        clearTimeout(toastTimeout);
        toast.textContent = message;
        toast.classList.remove('hidden');
        
        // Force reflow
        void toast.offsetWidth;
        
        toast.classList.add('show');
        
        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.classList.add('hidden'), 300);
        }, 2000);
    };

    const copyToClipboard = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            showToast('Copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy: ', err);
            const textArea = document.createElement("textarea");
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("Copy");
            textArea.remove();
            showToast('Copied to clipboard!');
        }
    };

    const escapeCSV = (str) => {
        if (str == null) return '';
        const stringified = String(str);
        if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
            return `"${stringified.replace(/"/g, '""')}"`;
        }
        return stringified;
    };

    const exportToCSV = () => {
        if (filteredNotes.length === 0) return;

        const headers = ['Date', 'Title', 'Summary', 'Link'];
        const csvRows = [];
        csvRows.push(headers.join(','));

        filteredNotes.forEach(note => {
            const date = new Date(note.published).toLocaleDateString('en-US');
            const title = stripHtml(note.title);
            const summary = stripHtml(note.content).trim();
            const link = note.link;

            const row = [
                escapeCSV(date),
                escapeCSV(title),
                escapeCSV(summary),
                escapeCSV(link)
            ];
            csvRows.push(row.join(','));
        });

        const csvContent = '\uFEFF' + csvRows.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'bigquery_release_notes.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const renderNotes = (notes) => {
        notesContainer.innerHTML = '';
        emptyState.classList.add('hidden');
        
        if (notes.length === 0 && currentNotes.length > 0) {
            emptyState.classList.remove('hidden');
            return;
        }

        notes.forEach(note => {
            const relativeDate = getRelativeTime(note.published);
            const cleanTitle = stripHtml(note.title);
            const cleanContent = stripHtml(note.content);
            const shortContent = cleanContent.substring(0, 100) + '...';
            
            const tweetText = `BigQuery Update: ${cleanTitle}\n\n${shortContent}\n\nRead more: ${note.link}`;
            const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`;
            
            const copyText = `${cleanTitle}\n${relativeDate}\n\n${cleanContent}\n\nLink: ${note.link}`;

            const card = document.createElement('div');
            card.className = 'note-card';
            
            const twitterPath = "M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z";
            const copyPath = "M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3";

            card.innerHTML = `
                <div class="note-header">
                    <div class="note-date">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ${relativeDate}
                    </div>
                    <h2 class="note-title"><a href="${note.link}" target="_blank" rel="noopener noreferrer">${note.title}</a></h2>
                </div>
                <div class="note-content">
                    ${note.content}
                </div>
                <div class="note-actions">
                    <button class="action-btn copy-btn" title="Copy to clipboard" aria-label="Copy note">
                        <svg class="btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${copyPath}"></path></svg>
                        Copy
                    </button>
                    <a href="${tweetUrl}" target="_blank" rel="noopener noreferrer" class="action-btn tweet-btn" title="Tweet this update" aria-label="Tweet note">
                        <svg class="btn-icon tweet-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${twitterPath}"></path></svg>
                        Tweet
                    </a>
                </div>
            `;
            
            card.querySelector('.copy-btn').addEventListener('click', () => {
                copyToClipboard(copyText);
            });

            notesContainer.appendChild(card);
        });
    };

    const applySearch = () => {
        const query = searchInput.value.toLowerCase().trim();
        if (!query) {
            filteredNotes = [...currentNotes];
        } else {
            filteredNotes = currentNotes.filter(note => {
                const titleMatch = stripHtml(note.title).toLowerCase().includes(query);
                const contentMatch = stripHtml(note.content).toLowerCase().includes(query);
                return titleMatch || contentMatch;
            });
        }
        renderNotes(filteredNotes);
        exportCsvBtn.disabled = filteredNotes.length === 0;
    };

    searchInput.addEventListener('input', applySearch);
    refreshBtn.addEventListener('click', fetchNotes);
    exportCsvBtn.addEventListener('click', exportToCSV);
    retryBtn.addEventListener('click', fetchNotes);

    // Scroll to Top Logic
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Theme Toggle Logic
    const htmlElement = document.documentElement;
    const sunIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
    const moonIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;

    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'light') {
        htmlElement.setAttribute('data-theme', 'light');
        themeToggleBtn.innerHTML = moonIcon;
    } else {
        themeToggleBtn.innerHTML = sunIcon;
    }

    themeToggleBtn.addEventListener('click', () => {
        if (htmlElement.getAttribute('data-theme') === 'light') {
            htmlElement.removeAttribute('data-theme');
            localStorage.setItem('theme', 'dark');
            themeToggleBtn.innerHTML = sunIcon;
        } else {
            htmlElement.setAttribute('data-theme', 'light');
            localStorage.setItem('theme', 'light');
            themeToggleBtn.innerHTML = moonIcon;
        }
    });

    // Initial fetch
    fetchNotes();
});
