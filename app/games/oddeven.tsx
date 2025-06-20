import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, RotateCcw } from 'lucide-react-native';
import { DiceAnimation } from '@/components/DiceAnimation';
import { useGame } from '@/contexts/GameContext';
import { GameResult } from '@/types/game';

export default function OddEvenGame() {
  const { addGameResult } = useGame();
  const [dice, setDice] = useState([1, 1, 1]);
  const [isRolling, setIsRolling] = useState(false);
  const [selectedBet, setSelectedBet] = useState<'odd' | 'even' | null>(null);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const rollTimeoutRef = useRef<NodeJS.Timeout>();

  const rollDice = () => {
    if (!selectedBet) {
      Alert.alert('Select Bet', 'Please choose Odd or Even before rolling!');
      return;
    }

    setIsRolling(true);
    setGameResult(null);

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
      const isOdd = total % 2 === 1;
      const isEven = total % 2 === 0;
      
      let result: 'win' | 'lose' = 'lose';
      let points = 0;
      
      if ((selectedBet === 'odd' && isOdd) || (selectedBet === 'even' && isEven)) {
        result = 'win';
        points = 8;
        setGameResult(`You Win! Total: ${total} (${isOdd ? 'ODD' : 'EVEN'})`);
      } else {
        result = 'lose';
        points = -4;
        setGameResult(`You Lose! Total: ${total} (${isOdd ? 'ODD' : 'EVEN'})`);
      }
      
      setScore(prev => prev + points);
      
      // Add to game history
      const gameResult: GameResult = {
        id: Date.now().toString(),
        gameType: 'oddeven',
        dice: newDice,
        bet: selectedBet,
        score: points,
        timestamp: new Date(),
        result,
      };
      
      addGameResult(gameResult);
    }, 1500); // Faster than other games for quick play
  };

  const resetGame = () => {
    setDice([1, 1, 1]);
    setSelectedBet(null);
    setGameResult(null);
    setScore(0);
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
        <Text style={styles.title}>Odd/Even</Text>
        <TouchableOpacity onPress={resetGame} style={styles.resetButton}>
          <RotateCcw size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Score: {score}</Text>
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
          <Text style={styles.totalText}>Total: {total}</Text>
          <Text style={styles.currentResult}>
            Currently: {total % 2 === 0 ? 'EVEN' : 'ODD'}
          </Text>
          {gameResult && (
            <Text style={[
              styles.resultText,
              { color: gameResult.includes('Win') ? '#10B981' : '#EF4444' }
            ]}>
              {gameResult}
            </Text>
          )}
        </View>

        <View style={styles.bettingContainer}>
          <Text style={styles.bettingTitle}>Make Your Bet</Text>
          <View style={styles.betButtons}>
            <TouchableOpacity
              style={[
                styles.betButton,
                styles.oddButton,
                selectedBet === 'odd' && styles.selectedBet,
              ]}
              onPress={() => setSelectedBet('odd')}
              disabled={isRolling}
            >
              <Text style={styles.betButtonText}>ODD</Text>
              <Text style={styles.betButtonSubtext}>Win: +8 pts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.betButton,
                styles.evenButton,
                selectedBet === 'even' && styles.selectedBet,
              ]}
              onPress={() => setSelectedBet('even')}
              disabled={isRolling}
            >
              <Text style={styles.betButtonText}>EVEN</Text>
              <Text style={styles.betButtonSubtext}>Win: +8 pts</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quickTip}>
          <Text style={styles.tipText}>💡 Quick & Simple: 50/50 chance to win!</Text>
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
              {isRolling ? 'Rolling...' : 'Roll Dice'}
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
    fontFamily: 'Inter-Bold',
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
  currentResult: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 8,
  },
  resultText: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
  },
  bettingContainer: {
    marginBottom: 30,
  },
  bettingTitle: {
    fontFamily: 'Inter-Bold',
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
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 120,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  oddButton: {
    backgroundColor: '#F59E0B',
  },
  evenButton: {
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
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  betButtonSubtext: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#E5E7EB',
    marginTop: 4,
  },
  quickTip: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  tipText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
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
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  disabledButton: {
    opacity: 0.6,
  },
});