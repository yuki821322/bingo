"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './BingoLottery.module.css';

export default function BingoLottery() {
  const [drawnNumbers, setDrawnNumbers] = useState<number[]>([]);
  const [currentNumber, setCurrentNumber] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [sortOrder, setSortOrder] = useState<'latest' | 'ascending'>('latest');

  // 初期化時に空の配列で開始
  useEffect(() => {
    // メモリ内でのみ状態を管理
    setDrawnNumbers([]);
  }, []);

  const drawNumber = () => {
    if (drawnNumbers.length >= 75) {
      alert('全ての数字が出ました！');
      return;
    }
    

    setIsDrawing(true);
    
    // アニメーション効果のための遅延
    setTimeout(() => {
      const availableNumbers = Array.from({ length: 75 }, (_, i) => i + 1)
        .filter(num => !drawnNumbers.includes(num));
      
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      const newNumber = availableNumbers[randomIndex];
      
      setCurrentNumber(newNumber);
      setDrawnNumbers(prev => [...prev, newNumber]);
      setIsDrawing(false);
    }, 1000);
  };

  const resetGame = () => {
    if (confirm('履歴をリセットしますか？')) {
      setDrawnNumbers([]);
      setCurrentNumber(null);
    }
  };

  const getSortedNumbers = () => {
    return sortOrder === 'latest' 
      ? [...drawnNumbers].reverse() 
      : [...drawnNumbers].sort((a, b) => a - b);
  };

  const getNumberColumn = (num: number): string => {
    if (num <= 15) return 'B';
    if (num <= 30) return 'I';
    if (num <= 45) return 'N';
    if (num <= 60) return 'G';
    return 'O';
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>ビンゴ抽選</h1>
        <Link href="/card" className={styles.cardLink}>
          ビンゴカードへ
        </Link>
      </header>

      <main className={styles.main}>
        <div className={styles.currentNumberSection}>
          <div className={styles.currentNumber}>
            {isDrawing ? (
              <div className={styles.drawing}>
                <div className={styles.spinner}></div>
                <p>抽選中...</p>
              </div>
            ) : (
              currentNumber && (
                <>
                  <span className={styles.column}>{getNumberColumn(currentNumber)}</span>
                  <span className={styles.number}>{currentNumber}</span>
                </>
              )
            )}
          </div>
          
          <button 
            onClick={drawNumber} 
            disabled={isDrawing || drawnNumbers.length >= 75}
            className={styles.drawButton}
          >
            {drawnNumbers.length >= 75 ? '完了' : '次の数字を出す'}
          </button>
        </div>

        <div className={styles.historySection}>
          <div className={styles.historyHeader}>
            <h2>出た数字の履歴 ({drawnNumbers.length}/75)</h2>
            <div className={styles.controls}>
              <select 
                value={sortOrder} 
                onChange={(e) => setSortOrder(e.target.value as 'latest' | 'ascending')}
                className={styles.sortSelect}
              >
                <option value="latest">最新順</option>
                <option value="ascending">昇順</option>
              </select>
              <button onClick={resetGame} className={styles.resetButton}>
                リセット
              </button>
            </div>
          </div>

          <div className={styles.numberGrid}>
            {getSortedNumbers().map((num) => (
              <div 
                key={num} 
                className={`${styles.historyNumber} ${styles[`column${getNumberColumn(num)}`]}`}
              >
                <span className={styles.historyColumn}>{getNumberColumn(num)}</span>
                <span className={styles.historyNumberValue}>{num}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}