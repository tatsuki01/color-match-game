from flask import Flask, jsonify, request
from flask_cors import CORS
import random
import json
import os

app = Flask(__name__)
CORS(app)  # フロントエンドとのCORSエラーを防ぐ

history_file = "game_records.json"
COLORS = ["#FFC0CB", "#87CEFA"]

@app.route("/", methods=["GET"])  # 追加する
def home():
    return jsonify({"message": "Flask server is running!"}), 200

def generate_target():
    return [[random.choice(COLORS) for _ in range(3)] for _ in range(3)]

def save_record(time_taken):
    records = load_records()
    records.append(time_taken)
    with open(history_file, "w") as file:
        json.dump(records, file)

def load_records():
    if os.path.exists(history_file):
        with open(history_file, "r") as file:
            return json.load(file)
    return []

@app.route("/new_game", methods=["GET"])
def new_game():
    return jsonify({"target": generate_target()})

@app.route("/save_score", methods=["POST"])
def save_score():
    data = request.json
    save_record(data["time"])
    return jsonify({"message": "Score saved!"})

@app.route("/records", methods=["GET"])
def get_records():
    records = sorted(load_records())[:10]
    return jsonify({"records": records})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))  # PORTを環境変数から取得
    app.run(host="0.0.0.0", port=5000, debug=True)
