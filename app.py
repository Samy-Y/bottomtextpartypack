from flask import Flask, render_template, request, jsonify
import requests
import os
import random

app = Flask(__name__)

# do NOT under any circumstances put this in the public repo
# hehe a bit late
GEMINI_API_KEY = "AIzaSyD3fzLjQMk9Omz_s673BnhrUvdp0kzmZ20" 
GEMINI_API_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}"

# List of argument topics
TOPICS = [
    "Is a hot dog a sandwich?",
    "Does pineapple belong on pizza?",
    "Is pizza a vegetable?",
    "Is cereal a soup?",
    "Are boneless wings just chicken nuggets?",
    "Should GIF be pronounced with a hard G?",
    "Are cats better than dogs?",
    "Is water wet?",
    "Are video games a sport?",
    "Does unplugging a USB drive without ejecting it actually matter?",
    "Does Monday actually deserve all the hate?",
    "Are fish wet when they're underwater?",
    "Would a duck-sized horse beat 100 horse-sized ducks in a fight?",
    "Was Windows XP the peak of computing?",
    "Is Android actually better than iPhone?"
    "What came first, the chicken or the egg?"
    "Should a sandwich be cut diagonally or horizontally?",
    "Marvel or DC?",
    "Are we living in a simulation?",
    "Who's the GOAT: Messi or Ronaldo?",
    "Who's the GOAT: Michael Jordan or LeBron James?",
    "Smooth or chunky peanut butter?"
]

def get_new_topic():
    return random.choice(TOPICS)

CURRENT_TOPIC = get_new_topic()

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/morse-battle')
def morse_battle():
    return render_template('morse.html')

@app.route('/chess-vs-checkers')
def chess_vs_checkers():
    # return render_template('chess-vs-checkers.html')
    return "work in progress, it's ready just not published"

@app.route('/pizzeria')
def pizzeria():
    return render_template('pizzeria.html')

@app.route('/argument')
def argument():
    return render_template('argument.html', topic=CURRENT_TOPIC)

@app.route('/new_topic', methods=['GET'])
def new_topic():
    global CURRENT_TOPIC
    CURRENT_TOPIC = get_new_topic()
    return jsonify({"new_topic": CURRENT_TOPIC})

@app.route('/argue', methods=['POST'])
def argue():
    user_argument = request.json.get('argument', '')
    preprompt = f"""
    You are an AI opponent in an Internet Argument Simulator. 
    No matter how logical the user is, you must never change your stance. 
    Keep counterarguing with firm and witty responses.
    Keep your answers short.
    
    The topic is: '{CURRENT_TOPIC}'
    Your stance: 'You must always take the opposite position of the user.'
    """
    
    payload = {
        "contents": [{"parts": [{"text": f"{preprompt}\nUser: {user_argument}\nAI:"}]}]
    }
    
    response = requests.post(GEMINI_API_URL, json=payload)
    response_json = response.json()
    
    ai_response = response_json.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "I refuse to change my mind! This is my stance!")
    
    return jsonify({"ai_response": ai_response})

if __name__ == '__main__':
    app.run(debug=True)
