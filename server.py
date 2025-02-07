from flask import Flask, jsonify, request
import random
import json
import os

app = Flask(__name__)
history_file = "game_records.json"

COLORS = ["#FFC0CB", "#87CEFA"]

def generate_target():
    """ 3x3 のランダムなマス目を生成する """
    return [[random.choice(COLORS) for _ in range(3)] for _ in range(3)]

def save_record(time_taken):
    """ ゲームのスコアを記録する """
    records = load_records()
    records.append(time_taken)
    with open(history_file, "w") as file:
        json.dump(records, file)

def load_records():
    """ 過去のスコアを読み込む """
    if os.path.exists(history_file):
        with open(history_file, "r") as file:
            return json.load(file)
    return []

@app.route("/new_game", methods=["GET"])
def new_game():
    """ 新しいゲームの開始 (お題を生成) """
    return jsonify({"target": generate_target()})

@app.route("/save_score", methods=["POST"])
def save_score():
    """ ゲームクリア時のスコアを保存 """
    data = request.json
    save_record(data["time"])
    return jsonify({"message": "Score saved!"})

@app.route("/records", methods=["GET"])
def get_records():
    """ 過去の記録を取得 (上位10件) """
    records = sorted(load_records())[:10]
    return jsonify({"records": records})

if __name__ == "__main__":
    app.run(debug=True, port=5000)
