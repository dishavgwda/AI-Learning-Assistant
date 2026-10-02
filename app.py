from flask import Flask, render_template, request, jsonify
from dotenv import load_dotenv
from google import genai
import os
import json

load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv("GEMINI_API_KEY")

if not API_KEY:
    raise ValueError("GEMINI_API_KEY is missing. Check your .env file.")

client = genai.Client(api_key=API_KEY)

MODEL = "gemini-3.8-flash"


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/generate-lesson", methods=["POST"])
def generate_lesson():
    try:
        data = request.get_json()

        topic = data.get("topic", "").strip()
        level = data.get("level", "Beginner")

        if not topic:
            return jsonify({
                "success": False,
                "error": "Please enter a topic."
            }), 400

        prompt = f"""
You are an AI learning assistant for college students.

Create a simple and engaging learning lesson.

Topic: {topic}
Student Level: {level}

Return ONLY valid JSON.
Do not use markdown.
Do not put ``` around the JSON.

Use exactly this structure:

{{
  "topic": "{topic}",
  "level": "{level}",
  "explanation": "A clear and simple explanation of the topic.",
  "example": "One practical real-world example.",
  "key_points": [
    "Important point 1",
    "Important point 2",
    "Important point 3",
    "Important point 4"
  ],
  "flashcards": [
    {{
      "question": "Question about the topic",
      "answer": "Simple answer"
    }},
    {{
      "question": "Another question",
      "answer": "Simple answer"
    }},
    {{
      "question": "Another question",
      "answer": "Simple answer"
    }},
    {{
      "question": "Another question",
      "answer": "Simple answer"
    }}
  ],
  "quiz": [
    {{
      "question": "Multiple choice question",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "Option A"
    }},
    {{
      "question": "Another multiple choice question",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "Option B"
    }},
    {{
      "question": "Another multiple choice question",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "answer": "Option C"
    }}
  ]
}}

Make the explanation suitable for a college student.
Keep everything concise, accurate and easy to understand.
"""

        response = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )

        text = response.text.strip()

        # Remove markdown code fences if Gemini adds them
        if text.startswith("```"):
            text = text.replace("```json", "")
            text = text.replace("```", "")
            text = text.strip()

        lesson = json.loads(text)

        return jsonify({
            "success": True,
            "lesson": lesson
        })

    except json.JSONDecodeError:
        return jsonify({
            "success": False,
            "error": "AI returned an invalid response. Please try again."
        }), 500

    except Exception as e:
        print("Gemini Error:", e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


@app.route("/ask-ai", methods=["POST"])
def ask_ai():
    try:
        data = request.get_json()

        question = data.get("question", "").strip()
        topic = data.get("topic", "").strip()

        if not question:
            return jsonify({
                "success": False,
                "error": "Please enter a question."
            }), 400

        prompt = f"""
You are a friendly AI tutor helping a college student.

The student is currently learning:
{topic}

Student question:
{question}

Answer clearly and simply.
Use examples when useful.
Do not be unnecessarily long.
"""

        response = client.models.generate_content(
            model=MODEL,
            contents=prompt
        )

        return jsonify({
            "success": True,
            "answer": response.text.strip()
        })

    except Exception as e:
        print("Ask AI Error:", e)

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)