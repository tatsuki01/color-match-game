import React, { useState, useEffect } from "react";

const API_URL = "https://color-match-game-q2e6.onrender.com"; // Flask サーバーの URL

function App() {
  const [targetGrid, setTargetGrid] = useState([]);
  const [userGrid, setUserGrid] = useState(() =>
    Array.from({ length: 3 }, () => Array(3).fill("#FFC0CB"))
  );
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [score, setScore] = useState(0);
  const [records, setRecords] = useState([]);
  const [gameOver, setGameOver] = useState(false);

  // ゲーム開始時にお題を取得
  useEffect(() => {
    if (score < 20) {
      fetch(`${API_URL}/new_game`)
        .then(res => res.json())
        .then(data => {
          setTargetGrid(data.target);
          setUserGrid(Array.from({ length: 3 }, () => Array(3).fill("#FFC0CB"))); // ユーザーのマスはリセットしない
          setStartTime(Date.now()); // 新しい問題の開始時間
        });
    }
  }, [score]);

  // タイマーを更新 (プレイ中のみカウント)
  useEffect(() => {
    if (startTime) {
      const timer = setInterval(() => {
        setElapsedTime(((Date.now() - startTime) / 1000).toFixed(1));
      }, 100);
      return () => clearInterval(timer);
    }
  }, [startTime]);

  // マスの色を切り替え
  const toggleColor = (x, y) => {
    setUserGrid(prevGrid =>
      prevGrid.map((row, i) =>
        row.map((cell, j) => (i === x && j === y ? (cell === "#FFC0CB" ? "#87CEFA" : "#FFC0CB") : cell))
      )
    );
  };

  // クリアチェック（`useEffect` で `userGrid` の変更を監視）
  useEffect(() => {
    if (JSON.stringify(userGrid) === JSON.stringify(targetGrid)) {
      const timeTaken = parseFloat(elapsedTime);
      setTotalTime(prevTotal => prevTotal + timeTaken); // 合計時間を加算

      if (score + 1 >= 20) {
        setGameOver(true);
        return;
      } else {
        setScore(prevScore => prevScore + 1);
      }
    }
  }, [userGrid, targetGrid, score]);

  // ゲーム終了時に記録を保存
  useEffect(() => {
    if (gameOver) {
      fetch(`${API_URL}/save_score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: totalTime.toFixed(1) }),
      });
    }
  }, [gameOver]);

  // 記録を取得
  const fetchRecords = () => {
    fetch(`${API_URL}/records`)
      .then(res => res.json())
      .then(data => setRecords(data.records));
  };

  return (
    <div className="container">
      {gameOver ? (
        <div className="result">
          <h2>ゲーム終了！合計時間: {totalTime.toFixed(1)} 秒</h2>
          <button onClick={() => window.location.reload()}>タイトルに戻る</button>
        </div>
      ) : (
        <>
          <h1>マス目をそろえろ！</h1>
          <h2>問題数: {score + 1} / 20</h2>
          <h3>現在の問題の時間: {elapsedTime} sec</h3>
          <h3>合計時間: {totalTime.toFixed(1)} sec</h3>

          <div className="game">
            <div className="target">
              <h4>お題</h4>
              {targetGrid.map((row, i) => (
                <div key={i} className="row">
                  {row.map((color, j) => (
                    <div key={j} className="cell" style={{ backgroundColor: color }}></div>
                  ))}
                </div>
              ))}
            </div>

            <div className="board">
              <h4>あなたのマス</h4>
              {userGrid.map((row, i) => (
                <div key={i} className="row">
                  {row.map((color, j) => (
                    <div
                      key={j}
                      className="cell"
                      style={{ backgroundColor: color }}
                      onClick={() => toggleColor(i, j)}
                    ></div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      <button onClick={fetchRecords}>記録を見る</button>
      <div className="records">
        {records.length > 0 ? records.map((rec, i) => <p key={i}>{i + 1}位: {rec} sec</p>) : <p>記録なし</p>}
      </div>
    </div>
  );
}

export default App;
