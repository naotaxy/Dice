import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { DiceAnimation } from '@/components/DiceAnimation';
import { useGame } from '@/contexts/GameContext';
import { GameResult } from '@/types/game';

export default function ChohanGame() {
  const { addGameResult } = useGame();
  const [dice, setDice] = useState([1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedBet, setSelectedBet] = useState<'cho' | 'han' | null>(null);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const rollTimeoutRef = useRef<NodeJS.Timeout>();

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const rollDice = () => {
    if (!selectedBet) {
      Alert.alert('ベットを選択', '丁または半を選択してからサイコロを振ってください！');
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
      ];
      
      setDice(newDice);
      setIsRolling(false);
      
      const total = newDice.reduce((sum, die) => sum + die, 0);
      const isCho = total % 2 === 0; // 偶数が丁
      const isHan = total % 2 === 1; // 奇数が半
      
      let result: 'win' | 'lose' = 'lose';
      let points = 0;
      let multiplier = 1;
      
      if ((selectedBet === 'cho' && isCho) || (selectedBet === 'han' && isHan)) {
        result = 'win';
        multiplier = streak >= 5 ? 3 : streak >= 3 ? 2 : 1;
        points = 8 * multiplier;
        setGameResult(`勝利！ 合計: ${total} (${isCho ? '丁（偶数）' : '半（奇数）'}) ${multiplier > 1 ? `×${multiplier}` : ''}`);
        setStreak(prev => prev + 1);
        triggerHaptic();
      } else {
        result = 'lose';
        points = -4;
        setGameResult(`敗北！ 合計: ${total} (${isCho ? '丁（偶数）' : '半（奇数）'})`);
        setStreak(0);
      }
      
      setScore(prev => prev + points);
      
      // ゲーム結果を記録
      const gameResult: GameResult = {
        id: Date.now().toString(),
        gameType: 'chohan',
        dice: newDice,
        bet: selectedBet,
        score: points,
        timestamp: new Date(),
        result,
        multiplier,
      };
      
      addGameResult(gameResult);
    }, 1500);
  };

  const resetGame = () => {
    setDice([1, 1]);
    setSelectedBet(null);
    setGameResult(null);
    setScore(0);
    setStreak(0);
    setIsRolling(false);
    if (rollTimeoutRef.current) {
      clearTimeout(rollTimeoutRef.current);
    }
  };

  const total = dice.reduce((sum, die) => sum + die, 0);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#10B981', '#06B6D4']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>丁半</Text>
        <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
          <RotateCcw size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>スコア: {score}</Text>
          {streak > 0 && (
            <Text style={styles.streakText}>
              連勝: {streak} {streak >= 5 ? '🔥🔥🔥' : streak >= 3 ? '🔥🔥' : '🔥'}
            </Text>
          )}
        </View>

        <View style={styles.diceContainer}>
          {dice.map((die, index) => (
            <DiceAnimation
              key={index}
              value={die}
              isRolling={isRolling}
              size={90}
            />
          ))}
        </View>

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>合計: {total}</Text>
          <Text style={styles.currentResult}>
            現在: {total % 2 === 0 ? '丁（偶数）' : '半（奇数）'}
          </Text>
          {gameResult && (
            <Text style={[
              styles.resultText,
              { color: gameResult.includes('勝利') ? '#10B981' : '#EF4444' }
            ]}>
              {gameResult}
            </Text>
          )}
        </View>

        <View style={styles.bettingContainer}>
          <Text style={styles.bettingTitle}>ベットを選択</Text>
          <View style={styles.betButtons}>
            <TouchableOpacity
              style={[
                styles.betButton,
                styles.choButton,
                selectedBet === 'cho' && styles.selectedBet,
              ]}
              onPress={() => setSelectedBet('cho')}
              disabled={isRolling}
            >
              <Text style={styles.betButtonText}>丁</Text>
              <Text style={styles.betButtonSubtext}>（偶数）</Text>
              <Text style={styles.betOdds}>勝利: +8pt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.betButton,
                styles.hanButton,
                selectedBet === 'han' && styles.selectedBet,
              ]}
              onPress={() => setSelectedBet('han')}
              disabled={isRolling}
            >
              <Text style={styles.betButtonText}>半</Text>
              <Text style={styles.betButtonSubtext}>（奇数）</Text>
              <Text style={styles.betOdds}>勝利: +8pt</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.bonusContainer}>
          <Text style={styles.bonusTitle}>連勝ボーナス</Text>
          <View style={styles.bonusGrid}>
            <View style={styles.bonusItem}>
              <Text style={styles.bonusMultiplier}>×2</Text>
              <Text style={styles.bonusText}>3連勝</Text>
            </View>
            <View style={styles.bonusItem}>
              <Text style={styles.bonusMultiplier}>×3</Text>
              <Text style={styles.bonusText}>5連勝</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.rollButton, (!selectedBet || isRolling) && styles.disabledButton]}
          onPress={rollDice}
          disabled={!selectedBet || isRolling}
        >
          <LinearGradient
            colors={selectedBet && !isRolling ? ['#10B981', '#059669'] : ['#6B7280', '#4B5563']}
            style={styles.rollButtonGradient}
          >
            <Text style={styles.rollButtonText}>
              {isRolling ? 'サイコロを振っています...' : 'サイコロを振る'}
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
  streakText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 16,
    color: '#F59E0B',
    marginTop: 4,
  },
  diceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginVertical: 40,
  },
  totalContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  totalText: {
    fontFamily: 'Inter-Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  currentResult: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  resultText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 18,
    textAlign: 'center',
  },
  bettingContainer: {
    marginBottom: 30,
  },
  bettingTitle: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  betButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  betButton: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  choButton: {
    backgroundColor: '#F59E0B',
  },
  hanButton: {
    backgroundColor: '#8B5CF6',
  },
  selectedBet: {
    borderColor: '#FBBF24',
    shadowColor: '#FBBF24',
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  betButtonText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  betButtonSubtext: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 4,
  },
  betOdds: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 12,
    color: '#D1FAE5',
  },
  bonusContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  bonusTitle: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  bonusGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bonusItem: {
    alignItems: 'center',
  },
  bonusMultiplier: {
    fontFamily: 'Inter-Bold',
    fontSize: 20,
    color: '#F59E0B',
  },
  bonusText: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
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