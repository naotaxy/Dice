import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, Platform } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { DiceAnimation } from '@/components/DiceAnimation';
import { useGame } from '@/contexts/GameContext';
import { GameResult } from '@/types/game';

export default function SicboGame() {
  const { addGameResult } = useGame();
  const [dice, setDice] = useState([1, 1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedBet, setSelectedBet] = useState<'big' | 'small' | null>(null);
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
      Alert.alert('ベットを選択', '大または小を選択してからサイコロを振ってください！');
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
      
      const total = newDice.reduce((sum, die) => sum + die, 0);
      const isBig = total >= 11 && total <= 17;
      const isSmall = total >= 4 && total <= 10;
      
      // トリプル（ゾロ目）の場合は引き分け
      const isTriple = newDice[0] === newDice[1] && newDice[1] === newDice[2];
      
      let result: 'win' | 'lose' | 'draw' = 'lose';
      let points = 0;
      let multiplier = 1;
      
      if (isTriple) {
        result = 'draw';
        points = 0;
        setGameResult(`引き分け！ トリプル${newDice[0]} (合計: ${total})`);
        setStreak(0);
      } else if ((selectedBet === 'big' && isBig) || (selectedBet === 'small' && isSmall)) {
        result = 'win';
        multiplier = streak >= 3 ? 2 : 1;
        points = 10 * multiplier;
        setGameResult(`勝利！ 合計: ${total} (${selectedBet === 'big' ? '大' : '小'}) ${multiplier > 1 ? `×${multiplier}` : ''}`);
        setStreak(prev => prev + 1);
        triggerHaptic();
      } else {
        result = 'lose';
        points = -5;
        setGameResult(`敗北！ 合計: ${total} (${isBig ? '大' : '小'})`);
        setStreak(0);
      }
      
      setScore(prev => prev + points);
      
      // ゲーム結果を記録
      const gameResult: GameResult = {
        id: Date.now().toString(),
        gameType: 'sicbo',
        dice: newDice,
        bet: selectedBet,
        score: points,
        timestamp: new Date(),
        result,
        multiplier,
      };
      
      addGameResult(gameResult);
    }, 2000);
  };

  const resetGame = () => {
    setDice([1, 1, 1]);
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
  const isTriple = dice[0] === dice[1] && dice[1] === dice[2];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>大小（シックボー）</Text>
        <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
          <RotateCcw size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>スコア: {score}</Text>
          {streak > 0 && (
            <Text style={styles.streakText}>連勝: {streak} {streak >= 3 && '🔥'}</Text>
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

        <View style={styles.totalContainer}>
          <Text style={styles.totalText}>合計: {total}</Text>
          {isTriple && <Text style={styles.tripleText}>トリプル！</Text>}
          {gameResult && (
            <Text style={[
              styles.resultText,
              { 
                color: gameResult.includes('勝利') ? '#10B981' : 
                       gameResult.includes('引き分け') ? '#F59E0B' : '#EF4444' 
              }
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
                styles.smallButton,
                selectedBet === 'small' && styles.selectedBet,
              ]}
              onPress={() => setSelectedBet('small')}
              disabled={isRolling}
            >
              <Text style={styles.betButtonText}>小</Text>
              <Text style={styles.betButtonSubtext}>(4-10)</Text>
              <Text style={styles.betOdds}>勝利: +10pt</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.betButton,
                styles.bigButton,
                selectedBet === 'big' && styles.selectedBet,
              ]}
              onPress={() => setSelectedBet('big')}
              disabled={isRolling}
            >
              <Text style={styles.betButtonText}>大</Text>
              <Text style={styles.betButtonSubtext}>(11-17)</Text>
              <Text style={styles.betOdds}>勝利: +10pt</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rulesContainer}>
          <Text style={styles.rulesTitle}>ルール</Text>
          <Text style={styles.rulesText}>• トリプル（ゾロ目）は引き分け</Text>
          <Text style={styles.rulesText}>• 3連勝以上で獲得ポイント2倍</Text>
          <Text style={styles.rulesText}>• 敗北時は-5ポイント</Text>
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
    fontSize: 28,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tripleText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 18,
    color: '#F59E0B',
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
  smallButton: {
    backgroundColor: '#3B82F6',
  },
  bigButton: {
    backgroundColor: '#EF4444',
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
    fontSize: 20,
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
  rulesContainer: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  rulesTitle: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  rulesText: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
    marginBottom: 4,
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