"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './BingoCard.module.css';

interface CellState {
  number: number | null;
  isChecked: boolean;
  isFree: boolean;
}

export default function BingoCard() {
  const [card, setCard] = useState<CellState[][]>([]);
  const [bingoLines, setBingoLines] = useState<number[]>([]);

  // カードを生成する関数
  const generateCard = (): CellState[][] => {
    const newCard: CellState[][] = Array(5).fill(null).map(() => Array(5).fill(null));
    
    // 各列の数字範囲: B(1-15), I(16-30), N(31-45), G(46-60), O(61-75)
    const columnRanges = [
      [1, 15],   // B
      [16, 30],  // I
      [31, 45],  // N
      [46, 60],  // G
      [61, 75]   // O
    ];

    for (let col = 0; col < 5; col++) {
      const [min, max] = columnRanges[col];
      const availableNumbers = Array.from(
        { length: max - min + 1 }, 
        (_, i) => min + i
      );
      
      // シャッフル
      for (let i = availableNumbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [availableNumbers[i], availableNumbers[j]] = [availableNumbers[j], availableNumbers[i]];
      }

      for (let row = 0; row < 5; row++) {
        if (row === 2 && col === 2) {
          // 中央のFREEマス
          newCard[row][col] = {
            number: null,
            isChecked: true,
            isFree: true
          };
        } else {
          newCard[row][col] = {
            number: availableNumbers[row < 2 ? row : row - 1],
            isChecked: false,
            isFree: false
          };
        }
      }
    }

    return newCard;
  };

  // ビンゴラインをチェックする関数
  const checkBingo = (cardState: CellState[][]): number[] => {
    const lines: number[] = [];

    // 横のライン
    for (let row = 0; row < 5; row++) {
      if (cardState[row].every(cell => cell.isChecked)) {
        lines.push(row);
      }
    }

    // 縦のライン
    for (let col = 0; col < 5; col++) {
      if (cardState.every(row => row[col].isChecked)) {
        lines.push(col + 5);
      }
    }

    // 斜めのライン（左上から右下）
    if (cardState.every((row, index) => row[index].isChecked)) {
      lines.push(10);
    }

    // 斜めのライン（右上から左下）
    if (cardState.every((row, index) => row[4 - index].isChecked)) {
      lines.push(11);
    }

    return lines;
  };

  // セルをクリックした時の処理
  const toggleCell = (row: number, col: number) => {
    if (card[row][col].isFree) return;

    const newCard = card.map((cardRow, rowIndex) =>
      cardRow.map((cell, colIndex) =>
        rowIndex === row && colIndex === col
          ? { ...cell, isChecked: !cell.isChecked }
          : cell
      )
    );

    setCard(newCard);
    
    const newBingoLines = checkBingo(newCard);
    setBingoLines(newBingoLines);

    // ビンゴが成立した時の通知
    if (newBingoLines.length > bingoLines.length) {
      setTimeout(() => {
        alert(`🎉 ビンゴ！ ${newBingoLines.length}ライン成立！`);
      }, 100);
    }
  };

  // カードを新しく生成
  const generateNewCard = () => {
    const newCard = generateCard();
    setCard(newCard);
    setBingoLines([]);
  };

  // 初期化
  useEffect(() => {
    // 初回読み込み時にカードを生成
    generateNewCard();
  }, []);

  // カードをリセット（チェック状態をクリア）
  const resetCard = () => {
    if (!confirm('チェック状態をリセットしますか？')) return;

    const resetCard = card.map(row =>
      row.map(cell => ({
        ...cell,
        isChecked: cell.isFree ? true : false
      }))
    );
    setCard(resetCard);
    setBingoLines([]);
  };

  const getColumnLetter = (col: number): string => {
    return ['B', 'I', 'N', 'G', 'O'][col];
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>
          ← 抽選画面へ
        </Link>
        <h1>ビンゴカード</h1>
        <div className={styles.controls}>
          <button onClick={generateNewCard} className={styles.newCardButton}>
            新カード
          </button>
          <button onClick={resetCard} className={styles.resetButton}>
            リセット
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {bingoLines.length > 0 && (
          <div className={styles.bingoAlert}>
            🎉 {bingoLines.length}ライン ビンゴ！ 🎉
          </div>
        )}

        <div className={styles.cardContainer}>
          <div className={styles.columnHeaders}>
            {['B', 'I', 'N', 'G', 'O'].map((letter) => (
              <div key={letter} className={styles.columnHeader}>
                {letter}
              </div>
            ))}
          </div>

          <div className={styles.bingoCard}>
            {card.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className={`${styles.cell} ${
                    cell.isChecked ? styles.checked : ''
                  } ${cell.isFree ? styles.free : ''}`}
                  onClick={() => toggleCell(rowIndex, colIndex)}
                  disabled={cell.isFree}
                >
                  {cell.isFree ? (
                    <span className={styles.freeText}>FREE</span>
                  ) : (
                    <span className={styles.number}>{cell.number}</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>

        <div className={styles.stats}>
          <p>チェック済み: {card.flat().filter(cell => cell.isChecked).length}/25</p>
          <p>ビンゴライン: {bingoLines.length}</p>
        </div>
      </main>
    </div>
  );
}