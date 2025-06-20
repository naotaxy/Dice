import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Trophy, Medal, Award, Crown, TrendingUp } from 'lucide-react-native';
import { UserAvatar } from '@/components/UserAvatar';
import { useGame } from '@/contexts/GameContext';

export default function RankingTab() {
  const { getTopPlayers, getRankInfo, currentUser } = useGame();
  const [selectedTab, setSelectedTab] = useState<'top100' | 'ranks'>('top100');
  
  const topPlayers = getTopPlayers(100);
  const currentUserRank = currentUser ? topPlayers.findIndex(player => player.id === currentUser.id) + 1 : 0;

  const rankTiers = [
    {
      tier: 'グランドマスター',
      minScore: 95,
      icon: '👑',
      color: '#FF6B35',
      gradient: ['#FF6B35', '#F7931E'],
      description: '最高峰のプレイヤー'
    },
    {
      tier: 'マスター',
      minScore: 85,
      icon: '💎',
      color: '#8B5CF6',
      gradient: ['#8B5CF6', '#3B82F6'],
      description: '熟練したベテランプレイヤー'
    },
    {
      tier: 'ダイヤモンド',
      minScore: 75,
      icon: '💠',
      color: '#06B6D4',
      gradient: ['#06B6D4', '#0891B2'],
      description: '上級者レベルの安定したプレイヤー'
    },
    {
      tier: 'プラチナ',
      minScore: 65,
      icon: '⭐',
      color: '#10B981',
      gradient: ['#10B981', '#059669'],
      description: '優秀な技術を持つプレイヤー'
    },
    {
      tier: 'ゴールド',
      minScore: 50,
      icon: '🥇',
      color: '#F59E0B',
      gradient: ['#F59E0B', '#D97706'],
      description: '基礎をマスターしたプレイヤー'
    },
    {
      tier: 'シルバー',
      minScore: 30,
      icon: '🥈',
      color: '#6B7280',
      gradient: ['#6B7280', '#4B5563'],
      description: 'ゲームを学習中のプレイヤー'
    },
    {
      tier: 'ブロンズ',
      minScore: 0,
      icon: '🥉',
      color: '#92400E',
      gradient: ['#92400E', '#78350F'],
      description: '新人プレイヤー'
    },
  ];

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown size={20} color="#FFD700" />;
      case 2: return <Medal size={20} color="#C0C0C0" />;
      case 3: return <Award size={20} color="#CD7F32" />;
      default: return <Text style={styles.positionNumber}>{position}</Text>;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1F2937', '#111827']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>ランキング</Text>
          <Text style={styles.subtitle}>頂点を目指そう！</Text>
        </View>
      </LinearGradient>

      {/* タブナビゲーション */}
      <View style={styles.tabNavigation}>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'top100' && styles.activeTab]}
          onPress={() => setSelectedTab('top100')}
        >
          <Trophy size={20} color={selectedTab === 'top100' ? '#FF6B35' : '#6B7280'} />
          <Text style={[styles.tabText, selectedTab === 'top100' && styles.activeTabText]}>
            TOP 100
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, selectedTab === 'ranks' && styles.activeTab]}
          onPress={() => setSelectedTab('ranks')}
        >
          <Medal size={20} color={selectedTab === 'ranks' ? '#FF6B35' : '#6B7280'} />
          <Text style={[styles.tabText, selectedTab === 'ranks' && styles.activeTabText]}>
            ランク
          </Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'top100' ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 現在のユーザーの順位 */}
          {currentUser && currentUserRank > 0 && (
            <View style={styles.currentUserCard}>
              <LinearGradient 
                colors={getRankInfo(currentUser.averageScore).gradient} 
                style={styles.currentUserGradient}
              >
                <Text style={styles.yourRankText}>あなたの順位</Text>
                <View style={styles.playerRow}>
                  <View style={styles.rankContainer}>
                    {getRankIcon(currentUserRank)}
                  </View>
                  <UserAvatar 
                    uri={currentUser.avatar} 
                    size={50}
                    rank={currentUser.rank}
                    showRank={true}
                    isOnline={true}
                  />
                  <View style={styles.playerInfo}>
                    <Text style={styles.playerName}>{currentUser.name}</Text>
                    <Text style={styles.playerRank}>{currentUser.rank}</Text>
                  </View>
                  <View style={styles.playerStats}>
                    <Text style={styles.averageScore}>{Math.floor(currentUser.averageScore)}</Text>
                    <Text style={styles.matchCount}>{currentUser.matchesPlayed}試合</Text>
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* トッププレイヤーリスト */}
          <View style={styles.leaderboard}>
            {topPlayers.map((player, index) => (
              <View key={player.id} style={[
                styles.playerRow,
                index < 3 && styles.topThreeRow,
                player.id === currentUser?.id && styles.currentUserRow
              ]}>
                <View style={styles.rankContainer}>
                  {getRankIcon(index + 1)}
                </View>
                <UserAvatar 
                  uri={player.avatar} 
                  size={45}
                  rank={player.rank}
                  showRank={true}
                  isOnline={player.isOnline}
                />
                <View style={styles.playerInfo}>
                  <Text style={styles.playerName}>{player.name}</Text>
                  <Text style={styles.playerRank}>{player.rank}</Text>
                </View>
                <View style={styles.playerStats}>
                  <Text style={styles.averageScore}>{Math.floor(player.averageScore)}</Text>
                  <Text style={styles.matchCount}>{player.matchesPlayed}試合</Text>
                  <Text style={styles.winRate}>勝率{Math.floor(player.winRate)}%</Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* 現在のユーザーランク情報 */}
          {currentUser && (
            <View style={styles.currentRankCard}>
              <LinearGradient 
                colors={getRankInfo(currentUser.averageScore).gradient} 
                style={styles.rankCardGradient}
              >
                <View style={styles.rankHeader}>
                  <Text style={styles.currentRankTitle}>現在のランク</Text>
                  <Text style={styles.rankBadge}>
                    {getRankInfo(currentUser.averageScore).icon} {getRankInfo(currentUser.averageScore).tier}
                  </Text>
                </View>
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    {Math.floor(currentUser.averageScore)} / {getRankInfo(currentUser.averageScore).nextTierPoints} pt
                  </Text>
                  <View style={styles.progressBar}>
                    <View 
                      style={[
                        styles.progressFill, 
                        { 
                          width: `${(currentUser.averageScore / getRankInfo(currentUser.averageScore).nextTierPoints) * 100}%`,
                        }
                      ]} 
                    />
                  </View>
                </View>
              </LinearGradient>
            </View>
          )}

          {/* ランクティア */}
          <View style={styles.rankTiers}>
            {rankTiers.map((rank) => (
              <View key={rank.tier} style={styles.rankTierCard}>
                <LinearGradient colors={rank.gradient} style={styles.rankTierGradient}>
                  <View style={styles.rankTierHeader}>
                    <Text style={styles.rankIcon}>{rank.icon}</Text>
                    <View style={styles.rankTierInfo}>
                      <Text style={styles.rankTierName}>
                        {rank.tier}
                      </Text>
                      <Text style={styles.rankTierRequirement}>
                        {rank.minScore}+ 平均スコア
                      </Text>
                    </View>
                    <TrendingUp size={20} color="#FFFFFF" />
                  </View>
                  <Text style={styles.rankTierDescription}>{rank.description}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    alignItems: 'center',
  },
  title: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 28,
    color: '#FFFFFF',
  },
  subtitle: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 16,
    color: '#9CA3AF',
    marginTop: 4,
  },
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: 'rgba(255, 107, 53, 0.1)',
  },
  tabText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  activeTabText: {
    color: '#FF6B35',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  currentUserCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  currentUserGradient: {
    padding: 16,
  },
  yourRankText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  leaderboard: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1F2937',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
  },
  topThreeRow: {
    backgroundColor: '#374151',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  currentUserRow: {
    borderWidth: 2,
    borderColor: '#10B981',
  },
  rankContainer: {
    width: 40,
    alignItems: 'center',
  },
  positionNumber: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#9CA3AF',
  },
  playerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  playerName: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  playerRank: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  playerStats: {
    alignItems: 'flex-end',
  },
  averageScore: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FF6B35',
  },
  matchCount: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  winRate: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 1,
  },
  currentRankCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  rankCardGradient: {
    padding: 20,
  },
  rankHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  currentRankTitle: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  rankBadge: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  progressContainer: {
    marginTop: 8,
  },
  progressText: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 14,
    color: '#E5E7EB',
    marginBottom: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  rankTiers: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  rankTierCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rankTierGradient: {
    padding: 16,
  },
  rankTierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  rankTierInfo: {
    flex: 1,
  },
  rankTierName: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 18,
    color: '#FFFFFF',
  },
  rankTierRequirement: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 2,
  },
  rankTierDescription: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
  },
});