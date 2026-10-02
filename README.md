🎓 Learnly AI — AI Learning Assistant

Learnly AI is a Generative AI-powered learning assistant designed to help students understand and revise any topic in a simple, personalized, and interactive way.

Students can enter a topic, choose their learning level, and receive AI-generated learning content instantly.

✨ Features

* 🤖 AI-Powered Lessons — Generates simple and easy-to-understand explanations for any topic.
* 🎯 Personalized Learning — Provides content based on the student’s selected learning level.
* 🌍 Real-World Examples — Explains concepts using practical examples.
* 💡 Key Points — Highlights the most important concepts for quick revision.
* 🔄 Interactive Flashcards — Allows students to flip cards and reveal answers.
* 🧠 Smart Quizzes — Generates multiple-choice questions to test understanding.
* 💬 AI Tutor — Students can ask follow-up questions and receive instant AI-generated answers.
* 📱 Responsive Interface — Provides a clean and interactive learning experience across different screen sizes.

🛠️ Technologies Used

Frontend

* HTML5
* CSS3
* JavaScript

Backend

* Python
* Flask

Generative AI

* Google Gemini API
* Google GenAI Python SDK

🏗️ System Architecture

Student
   ↓
Learning Interface
   ↓
HTML + CSS + JavaScript
   ↓
Python Flask Backend
   ↓
Google Gemini API
   ↓
AI-Generated Learning Content
   ↓
Interactive Learning Interface

📂 Project Structure

AI-Learning-Assistant/
│
├── app.py
├── requirements.txt
├── .env
├── .gitignore
│
├── templates/
│   └── index.html
│
├── static/
│   ├── style.css
│   └── script.js
│
└── venv/

🧠 How the AI Works

1. The student enters a topic and selects a learning level.
2. The frontend sends the information to the Flask backend.
3. Flask creates a structured prompt for the Gemini AI model.
4. Gemini generates a personalized lesson in a structured format.
5. The backend processes the AI response and sends it to the frontend.
6. The website displays the explanation, example, key points, flashcards, and quiz.
7. Students can also ask follow-up questions through the AI Tutor feature.

🔐 Security

The Gemini API key is stored securely in a .env file rather than directly in the source code.

The .env file is included in .gitignore, preventing the API key from being uploaded to the public GitHub repository.

API keys should never be shared publicly.

🎯 Project Objective

The objective of Learnly AI is to demonstrate how Generative AI, Python, Flask, and modern web technologies can be combined to create a practical and interactive educational application.

👩‍💻 Project

Learnly AI — AI Learning Assistant

Built using Python, Flask, HTML, CSS, JavaScript, and Google Gemini AI.
