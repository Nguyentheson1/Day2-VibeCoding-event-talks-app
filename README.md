# BigQuery Release Notes App 🚀

A modern web application that automatically fetches and displays the latest [Google Cloud BigQuery Release Notes](https://cloud.google.com/bigquery/docs/release-notes). 

Built with **Python Flask** on the backend and **Vanilla HTML/CSS/JS** on the frontend, this app features a beautiful dark-mode UI, responsive design, and built-in Twitter sharing capabilities.

## Features ✨
- **Real-time Fetching:** Proxies the official Google Cloud XML RSS feed.
- **Modern UI:** Sleek, responsive dark theme built from scratch without heavy frontend frameworks.
- **Twitter Integration:** One-click Tweet buttons for every release note.
- **CORS Bypass:** Uses a Flask backend to avoid cross-origin restrictions when reading XML feeds.

## Tech Stack 🛠️
- **Backend:** Python, Flask, `feedparser`, `requests`
- **Frontend:** HTML5, CSS3 (Variables, Flexbox/Grid), Vanilla JavaScript

## Project Structure 📂
```text
.
├── app.py                  # Flask server and API endpoints
├── requirements.txt        # Python dependencies
├── templates/
│   └── index.html          # Main application layout
└── static/
    ├── css/
    │   └── style.css       # Styling and animations
    └── js/
        └── app.js          # Client-side logic and API fetching
```

## Getting Started 🚀

### 1. Prerequisites
- Python 3.x installed on your machine.

### 2. Installation
Clone the repository and set up your virtual environment:

```bash
git clone https://github.com/Nguyentheson1/Day2-VibeCoding-event-talks-app.git
cd Day2-VibeCoding-event-talks-app

# Create a virtual environment
python -m venv venv

# Activate the virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Running the App
Start the Flask development server:

```bash
python app.py
```

Open your web browser and navigate to: **http://127.0.0.1:5000**
