import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Swords, Users, Shuffle, Play, Clock, Trophy } from 'lucide-react-native';
import { UserAvatar } from '@/components/UserAvatar';
import { useGame } from '@/contexts/GameContext';

export default function BattleTab() {
  const { currentUser, users, createBattle, battles } = useGame();
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [selectedGameType, setSelectedGameType] = useState<'sicbo' | 'chinchirorin' | 'chohan'>('sicbo');

  const onlineUsers = users.filter(user => user.isOnline && user.id !== currentUser?.id);

  const togglePlayerSelection = (userId: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else if (prev.length < 9) {
        return [...prev, userId];
      } else {
        Alert.alert('上限に達しました', '最大10人まで対戦可能です！');
        return prev;
      }
    });
  };

  const startBattle = () => {
    if (selectedPlayers.length === 0) {
      Alert.alert('プレイヤーが選択されていません', '対戦相手を選択してください！');
      return;
    }

    if (!currentUser) {
      Alert.alert('エラー', 'ログインしてから対戦を開始してください！');
      return;
    }

    const battlePlayers = [currentUser.id, ...selectedPlayers];
    const battle = createBattle(battlePlayers, selectedGameType);
    
    Alert.alert(
      '対戦が作成されました！',
      `${getGameTypeName(selectedGameType)}で${selectedPlayers.length}人との対戦が開始されました！`,
      [{ text: 'OK' }]
    );
    
    setSelectedPlayers([]);
  };

  const startRandomMatch = () => {
    if (onlineUsers.length === 0) {
      Alert.alert('オンラインプレイヤーなし', 'ランダムマッチング可能なプレイヤーがいません！');
      return;
    }

    const randomOpponents = onlineUsers
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.min(3, onlineUsers.length))
      .map(user => user.id);

    if (currentUser) {
      const battle = createBattle([currentUser.id, ...randomOpponents], selectedGameType);
      Alert.alert(
        'ランダムマッチ成立！',
        `${randomOpponents.length}人の対戦相手が見つかりました！`,
        [{ text: '対戦開始', onPress: () => {} }]
      );
    }
  };

  const getGameTypeName = (gameType: string) => {
    switch (gameType) {
      case 'sicbo': return '大小';
      case 'chinchirorin': return 'チンチロリン';
      case 'chohan': return '丁半';
      default: return gameType;
    }
  };

  const gameTypes = [
    { 
      id: 'sicbo', 
      name: '大小', 
      description: 'シックボーの定番ゲーム',
      gradient: ['#FF6B35', '#F7931E']
    },
    { 
      id: 'chinchirorin', 
      name: 'チンチロリン', 
      description: '日本の伝統的なサイコロゲーム',
      gradient: ['#8B5CF6', '#3B82F6']
    },
    { 
      id: 'chohan', 
      name: '丁半', 
      description: '50/50の運試しゲーム',
      gradient: ['#10B981', '#06B6D4']
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#1F2937', '#111827']} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>対戦アリーナ</Text>
          <Text style={styles.subtitle}>他のプレイヤーと勝負しよう！</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* ゲームタイプ選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ゲームタイプを選択</Text>
          <View style={styles.gameTypeGrid}>
            {gameTypes.map((game) => (
              <TouchableOpacity
                key={game.id}
                style={[
                  styles.gameTypeCard,
                  selectedGameType === game.id && styles.selectedGameType,
                ]}
                onPress={() => setSelectedGameType(game.id as any)}
              >
                <LinearGradient
                  colors={selectedGameType === game.id ? game.gradient : ['#374151', '#374151']}
                  style={styles.gameTypeGradient}
                >
                  <Text style={styles.gameTypeName}>{game.name}</Text>
                  <Text style={styles.gameTypeDescription}>{game.description}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* クイックアクション */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>クイック対戦</Text>
          <TouchableOpacity style={styles.randomMatchButton} onPress={startRandomMatch}>
            <LinearGradient colors={['#FF6B35', '#F7931E']} style={styles.buttonGradient}>
              <Shuffle size={24} color="#FFFFFF" />
              <Text style={styles.buttonText}>ランダムマッチ</Text>
              <Text style={styles.buttonSubtext}>ランダムな相手と対戦</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* プレイヤー選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            対戦相手を選択 ({selectedPlayers.length}/9)
          </Text>
          
          {onlineUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Users size={48} color="#6B7280" />
              <Text style={styles.emptyText}>オンラインプレイヤーがいません</Text>
            </View>
          ) : (
            <View style={styles.playerGrid}>
              {onlineUsers.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[
                    styles.playerCard,
                    selectedPlayers.includes(user.id) && styles.selectedPlayer,
                  ]}
                  onPress={() => togglePlayerSelection(user.id)}
                >
                  <UserAvatar 
                    uri={user.avatar} 
                    size={50} 
                    rank={user.rank}
                    showRank={true}
                    isOnline={true}
                  />
                  <Text style={styles.playerName}>{user.name}</Text>
                  <Text style={styles.playerRank}>{user.rank}</Text>
                  <Text style={styles.playerAverage}>{Math.floor(user.averageScore)}pt 平均</Text>
                  <Text style={styles.playerWinRate}>勝率 {Math.floor(user.winRate)}%</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* 対戦開始ボタン */}
        {selectedPlayers.length > 0 && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.startBattleButton} onPress={startBattle}>
              <LinearGradient colors={['#10B981', '#059669']} style={styles.buttonGradient}>
                <Swords size={24} color="#FFFFFF" />
                <Text style={styles.buttonText}>対戦開始</Text>
                <Text style={styles.buttonSubtext}>
                  {selectedPlayers.length + 1}人 - {getGameTypeName(selectedGameType)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* 最近の対戦 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>最近の対戦</Text>
          {battles.length === 0 ? (
            <View style={styles.emptyState}>
              <Play size={48} color="#6B7280" />
              <Text style={styles.emptyText}>まだ対戦がありません</Text>
            </View>
          ) : (
            battles.slice(0, 3).map((battle) => (
              <View key={battle.id} style={styles.battleCard}>
                <View style={styles.battleHeader}>
                  <Text style={styles.battleType}>{getGameTypeName(battle.gameType)}</Text>
                  <View style={styles.battleStatusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: getStatusColor(battle.status) }]} />
                    <Text style={styles.battleStatus}>{getStatusText(battle.status)}</Text>
                  </View>
                </View>
                <View style={styles.battlePlayers}>
                  {battle.players.slice(0, 4).map((player) => (
                    <UserAvatar 
                      key={player.id}
                      uri={player.avatar}
                      size={30}
                      rank={player.rank}
                      isOnline={player.isOnline}
                    />
                  ))}
                  {battle.players.length > 4 && (
                    <View style={styles.morePlayersIndicator}>
                      <Text style={styles.morePlayersText}>+{battle.players.length - 4}</Text>
                    </View>
                  )}
                </View>
                <View style={styles.battleMeta}>
                  <Clock size={12} color="#6B7280" />
                  <Text style={styles.battleTime}>
                    {new Date(battle.createdAt).toLocaleDateString('ja-JP')}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'waiting': return '#F59E0B';
    case 'active': return '#10B981';
    case 'completed': return '#6B7280';
    default: return '#EF4444';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'waiting': return '待機中';
    case 'active': return '進行中';
    case 'completed': return '完了';
    default: return 'キャンセル';
  }
};

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
  content: {
    flex: 1,
    paddingTop: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 16,
  },
  gameTypeGrid: {
    paddingHorizontal: 20,
  },
  gameTypeCard: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  gameTypeGradient: {
    padding: 16,
  },
  selectedGameType: {
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  gameTypeName: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gameTypeDescription: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 14,
    color: '#E5E7EB',
  },
  randomMatchButton: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    padding: 20,
    alignItems: 'center',
  },
  buttonText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginTop: 8,
  },
  buttonSubtext: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 14,
    color: '#E5E7EB',
    marginTop: 4,
  },
  playerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  playerCard: {
    width: '48%',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedPlayer: {
    borderColor: '#10B981',
    backgroundColor: '#065F46',
  },
  playerName: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginTop: 8,
    textAlign: 'center',
  },
  playerRank: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  playerAverage: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  playerWinRate: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 11,
    color: '#6B7280',
    marginTop: 2,
  },
  startBattleButton: {
    marginHorizontal: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  battleCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
  },
  battleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  battleType: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 14,
    color: '#FF6B35',
  },
  battleStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  battleStatus: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  battlePlayers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  morePlayersIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
  },
  morePlayersText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 10,
    color: '#9CA3AF',
  },
  battleMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  battleTime: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  bottomPadding: {
    height: 40,
  },
});