import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { DiceAnimation } from '@/components/DiceAnimation';
import { useGame } from '@/contexts/GameContext';
import { GameResult } from '@/types/game';

export default function ChinchirorinGame() {
  const { addGameResult } = useGame();
  const [dice, setDice] = useState([1, 1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [rollCount, setRollCount] = useState(0);
  const [bestHand, setBestHand] = useState<string | null>(null);
  const rollTimeoutRef = useRef<NodeJS.Timeout>();

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const evaluateHand = (dice: number[]) => {
    const sorted = [...dice].sort((a, b) => a - b);
    
    // トリプル（三つ子）
    if (sorted[0] === sorted[1] && sorted[1] === sorted[2]) {
      if (sorted[0] === 1) return { type: 'ピンゾロ', score: 50, description: '最強の手！' };
      return { type: `${sorted[0]}のゾロ`, score: 30, description: '素晴らしい！' };
    }
    
    // ストレート
    if (sorted.join('') === '123') {
      return { type: 'ヒフミ', score: 25, description: '良い手！' };
    }
    if (sorted.join('') === '456') {
      return { type: 'シゴロ', score: 25, description: '良い手！' };
    }
    
    // ペア + 目
    const counts = dice.reduce((acc, die) => {
      acc[die] = (acc[die] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const pairs = Object.entries(counts).filter(([_, count]) => count === 2);
    if (pairs.length === 1) {
      const single = Object.entries(counts).find(([_, count]) => count === 1);
      if (single) {
        const singleValue = parseInt(single[0]);
        const pairValue = parseInt(pairs[0][0]);
        return { 
          type: `${pairValue}のペア`, 
          score: singleValue * 3, 
          description: `目: ${singleValue}` 
        };
      }
    }
    
    // 役なし
    const total = dice.reduce((sum, die) => sum + die, 0);
    return { type: '役なし', score: -5, description: `合計: ${total}` };
  };

  const rollDice = () => {
    if (rollCount >= 3) {
      Alert.alert('ゲーム終了', '3回振り終わりました！新しいゲームを始めてください。');
      return;
    }

    setIsRolling(true);
    setGameResult(null);
    triggerHaptic();

    if (rollTimeoutRef.current) {
      clearTimeout(rollTimeoutRef.current);
    }

    rollTimeoutRef.current = setTimeout(() => {
      const newDice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1,
      ];
      
      setDice(newDice);
      setIsRolling(false);
      setRollCount(prev => prev + 1);
      
      const evaluation = evaluateHand(newDice);
      setGameResult(`${evaluation.type} - ${evaluation.description}`);
      setScore(prev => prev + evaluation.score);
      
      // 最高の手を記録
      if (!bestHand || evaluation.score > 0) {
        setBestHand(evaluation.type);
      }
      
      // ゲーム結果を記録
      const gameResult: GameResult = {
        id: Date.now().toString(),
        gameType: 'chinchirorin',
        dice: newDice,
        bet: evaluation.type,
        score: evaluation.score,
        timestamp: new Date(),
        result: evaluation.score > 0 ? 'win' : 'lose',
      };
      
      addGameResult(gameResult);

      if (evaluation.score > 0) {
        triggerHaptic();
      }
    }, 2000);
  };

  const resetGame = () => {
    setDice([1, 1, 1]);
    setGameResult(null);
    setScore(0);
    setRollCount(0);
    setBestHand(null);
    setIsRolling(false);
    if (rollTimeoutRef.current) {
      clearTimeout(rollTimeoutRef.current);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#8B5CF6', '#3B82F6']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>チンチロリン</Text>
        <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
          <RotateCcw size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>スコア: {score}</Text>
          <Text style={styles.rollCountText}>振り回数: {rollCount}/3</Text>
          {bestHand && (
            <Text style={styles.bestHandText}>最高の手: {bestHand}</Text>
          )}
        </View>

        <View style={styles.diceContainer}>
          {dice.map((die, index) => (
            <DiceAnimation
              key={index}
              value={die}
              isRolling={isRolling}
              size={80}
            />
          ))}
        </View>

        {gameResult && (
          <View style={styles.resultContainer}>
            <Text style={[
              styles.resultText,
              { color: gameResult.includes('役なし') ? '#EF4444' : '#10B981' }
            ]}>
              {gameResult}
            </Text>
          </View>
        )}

        <View style={styles.rulesContainer}>
          <Text style={styles.rulesTitle}>役の強さ（強い順）</Text>
          <View style={styles.rulesList}>
            <Text style={styles.ruleItem}>👑 ピンゾロ (1-1-1): 50pt</Text>
            <Text style={styles.ruleItem}>🎯 ゾロ目 (2-2-2〜6-6-6): 30pt</Text>
            <Text style={styles.ruleItem}>📈 ヒフミ (1-2-3): 25pt</Text>
            <Text style={styles.ruleItem}>📈 シゴロ (4-5-6): 25pt</Text>
            <Text style={styles.ruleItem}>👥 ペア + 目: 目×3pt</Text>
            <Text style={styles.ruleItem}>❌ 役なし: -5pt</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.rollButton, (rollCount >= 3 || isRolling) && styles.disabledButton]}
          onPress={rollDice}
          disabled={rollCount >= 3 || isRolling}
        >
          <LinearGradient
            colors={rollCount < 3 && !isRolling ? ['#10B981', '#059669'] : ['#6B7280', '#4B5563']}
            style={styles.rollButtonGradient}
          >
            <Text style={styles.rollButtonText}>
              {isRolling ? 'サイコロを振っています...' : 
               rollCount >= 3 ? 'ゲーム終了' : 'サイコロを振る'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 20,
    color: '#FFFFFF',
  },
  resetButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scoreText: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
  },
  rollCountText: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 4,
  },
  bestHandText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 14,
    color: '#F59E0B',
    marginTop: 4,
  },
  diceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 40,
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resultText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  rulesContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
  },
  rulesTitle: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  rulesList: {
    gap: 6,
  },
  ruleItem: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
  },
  rollButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  rollButtonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  rollButtonText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
});