from flask import Flask, render_template, jsonify
import feedparser

app = Flask(__name__)

FEED_URL = "https://docs.cloud.google.com/feeds/bigquery-release-notes.xml"

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/api/notes")
def get_notes():
    try:
        feed = feedparser.parse(FEED_URL)
        entries = []
        for entry in feed.entries:
            entries.append({
                "title": entry.get("title", "No Title"),
                "link": entry.get("link", ""),
                "published": entry.get("published", ""),
                "summary": entry.get("summary", ""),
                "content": entry.get("content", [{"value": ""}])[0]["value"] if "content" in entry else entry.get("summary", "")
            })
        return jsonify({"status": "success", "data": entries})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
