import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { GameCard } from '@/components/GameCard';
import { useGame } from '@/contexts/GameContext';
import { UserAvatar } from '@/components/UserAvatar';
import { Settings, Bell } from 'lucide-react-native';

export default function GamesTab() {
  const { currentUser, loginWithLine } = useGame();

  const games = [
    {
      id: 'sicbo',
      title: '大小（シックボー）',
      description: '3つのサイコロの合計が大（11-17）か小（4-10）かを予想する定番ゲーム',
      image: 'https://images.pexels.com/photos/4050314/pexels-photo-4050314.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      gradient: ['#FF6B35', '#F7931E'],
      difficulty: '初級',
      playerCount: '1-10人',
    },
    {
      id: 'chinchirorin',
      title: 'チンチロリン',
      description: '日本の伝統的なサイコロゲーム。ゾロ目、ストレート、ペアで役を作ろう！',
      image: 'https://images.pexels.com/photos/6835271/pexels-photo-6835271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      gradient: ['#8B5CF6', '#3B82F6'],
      difficulty: '中級',
      playerCount: '1-6人',
    },
    {
      id: 'chohan',
      title: '丁半',
      description: '2つのサイコロの合計が丁（偶数）か半（奇数）かを当てるシンプルなゲーム',
      image: 'https://images.pexels.com/photos/4050315/pexels-photo-4050315.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      gradient: ['#10B981', '#06B6D4'],
      difficulty: '初級',
      playerCount: '1-8人',
    },
  ];

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient colors={['#1F2937', '#111827']} style={styles.loginContainer}>
          <View style={styles.loginContent}>
            <Text style={styles.loginTitle}>サイコロバトル</Text>
            <Text style={styles.loginSubtitle}>LINEでログインして始めよう</Text>
            <TouchableOpacity style={styles.lineLoginButton} onPress={loginWithLine}>
              <LinearGradient colors={['#00B900', '#00A000']} style={styles.lineButtonGradient}>
                <Text style={styles.lineButtonText}>LINEでログイン</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1F2937', '#111827']} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.userInfo}>
            <UserAvatar 
              uri={currentUser.avatar} 
              size={50} 
              rank={currentUser.rank}
              showRank={true}
              isOnline={true}
            />
            <View style={styles.userDetails}>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <Text style={styles.userRank}>
                {currentUser.rank} - {Math.floor(currentUser.averageScore)}pt
              </Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Bell size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Settings size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>ゲームを選択</Text>
        
        {games.map((game) => (
          <GameCard
            key={game.id}
            title={game.title}
            description={game.description}
            image={game.image}
            gradient={game.gradient}
            difficulty={game.difficulty}
            playerCount={game.playerCount}
            onPress={() => router.push(`/games/${game.id}`)}
          />
        ))}

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>あなたの戦績</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentUser.matchesPlayed}</Text>
              <Text style={styles.statLabel}>試合数</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.floor(currentUser.averageScore)}</Text>
              <Text style={styles.statLabel}>平均スコア</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{currentUser.totalScore}</Text>
              <Text style={styles.statLabel}>総スコア</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.floor(currentUser.winRate)}%</Text>
              <Text style={styles.statLabel}>勝率</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginContent: {
    alignItems: 'center',
  },
  loginTitle: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 32,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 16,
    color: '#9CA3AF',
    marginBottom: 40,
  },
  lineLoginButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  lineButtonGradient: {
    paddingHorizontal: 40,
    paddingVertical: 16,
    alignItems: 'center',
  },
  lineButtonText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
  },
  userName: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  userRank: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 14,
    color: '#9CA3AF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  sectionTitle: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
  },
  statsCard: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: '#1F2937',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statsTitle: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FF6B35',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  bottomPadding: {
    height: 40,
  },
});