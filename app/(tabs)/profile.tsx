import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard as Edit3, Settings, Eye, EyeOff, Trophy, Calendar, Target, LogOut, Share } from 'lucide-react-native';
import { UserAvatar } from '@/components/UserAvatar';
import { useGame } from '@/contexts/GameContext';

export default function ProfileTab() {
  const { currentUser, updateUserProfile, gameHistory, getRankInfo, logout } = useGame();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [profileVisible, setProfileVisible] = useState(currentUser?.profilePublic || true);

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loginPrompt}>
          <Text style={styles.loginText}>プロフィールを表示するにはログインしてください</Text>
        </View>
      </SafeAreaView>
    );
  }

  const rankInfo = getRankInfo(currentUser.averageScore);
  const recentGames = gameHistory.slice(0, 10);

  const handleSaveProfile = () => {
    if (editName.trim().length  < 2) {
      Alert.alert('無効な名前', '名前は2文字以上で入力してください。');
      return;
    }

    updateUserProfile({
      name: editName.trim(),
      profilePublic: profileVisible,
    });

    setIsEditing(false);
    Alert.alert('成功', 'プロフィールが更新されました！');
  };

  const handleCancelEdit = () => {
    setEditName(currentUser.name);
    setProfileVisible(currentUser.profilePublic);
    setIsEditing(false);
  };

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { text: 'ログアウト', style: 'destructive', onPress: logout }
      ]
    );
  };

  const getGameTypeDisplay = (gameType: string) => {
    switch (gameType) {
      case 'sicbo': return '大小';
      case 'chinchirorin': return 'チンチロリン';
      case 'chohan': return '丁半';
      default: return gameType;
    }
  };

  const winRate = recentGames.length > 0 
    ? Math.round((recentGames.filter(game => game.result === 'win').length / recentGames.length) * 100)
    : 0;

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={rankInfo.gradient} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.title}>プロフィール</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton}>
              <Share size={20} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
            >
              <Edit3 size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* プロフィールカード */}
        <View style={styles.profileCard}>
          <UserAvatar 
            uri={currentUser.avatar}
            size={100}
            rank={currentUser.rank}
            showRank={true}
            isOnline={true}
          />
          
          {isEditing ? (
            <View style={styles.editForm}>
              <TextInput
                style={styles.nameInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="名前を入力"
                placeholderTextColor="#6B7280"
                maxLength={20}
              />
              
              <TouchableOpacity
                style={styles.visibilityToggle}
                onPress={() => setProfileVisible(!profileVisible)}
              >
                {profileVisible ? (
                  <Eye size={20} color="#10B981" />
                ) : (
                  <EyeOff size={20} color="#6B7280" />
                )}
                <Text style={[styles.visibilityText, { color: profileVisible ? '#10B981' : '#6B7280' }]}>
                  プロフィール {profileVisible ? '公開' : '非公開'}
                </Text>
              </TouchableOpacity>

              <View style={styles.editActions}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit}>
                  <Text style={styles.cancelButtonText}>キャンセル</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                  <Text style={styles.saveButtonText}>保存</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{currentUser.name}</Text>
              <View style={styles.rankContainer}>
                <LinearGradient colors={rankInfo.gradient} style={styles.rankBadge}>
                  <Text style={styles.rankText}>
                    {rankInfo.icon} {rankInfo.tier}
                  </Text>
                </LinearGradient>
                <Text style={styles.rankPoints}>{Math.floor(currentUser.averageScore)} pt</Text>
              </View>
              <Text style={styles.profileStatus}>
                プロフィール: {currentUser.profilePublic ? '🌐 公開' : '🔒 非公開'}
              </Text>
              <Text style={styles.joinDate}>
                参加日: {new Date(currentUser.createdAt).toLocaleDateString('ja-JP')}
              </Text>
            </View>
          )}
        </View>

        {/* 統計グリッド */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Trophy size={24} color="#FF6B35" />
            <Text style={styles.statValue}>{currentUser.totalScore}</Text>
            <Text style={styles.statLabel}>総スコア</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={24} color="#10B981" />
            <Text style={styles.statValue}>{Math.floor(currentUser.averageScore)}</Text>
            <Text style={styles.statLabel}>平均スコア</Text>
          </View>
          <View style={styles.statCard}>
            <Calendar size={24} color="#8B5CF6" />
            <Text style={styles.statValue}>{currentUser.matchesPlayed}</Text>
            <Text style={styles.statLabel}>試合数</Text>
          </View>
          <View style={styles.statCard}>
            <Settings size={24} color="#F59E0B" />
            <Text style={styles.statValue}>{Math.floor(currentUser.winRate)}%</Text>
            <Text style={styles.statLabel}>勝率</Text>
          </View>
        </View>

        {/* ランク進捗 */}
        <View style={styles.progressCard}>
          <LinearGradient colors={rankInfo.gradient} style={styles.progressGradient}>
            <Text style={styles.progressTitle}>ランク進捗</Text>
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>
                次のランクまで {rankInfo.nextTierPoints - Math.floor(currentUser.averageScore)} pt
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill,
                    { 
                      width: `${(currentUser.averageScore / rankInfo.nextTierPoints) * 100}%`,
                    }
                  ]} 
                />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* 最近のゲーム */}
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>最近のゲーム</Text>
          {recentGames.length === 0 ? (
            <View style={styles.emptyHistory}>
              <Text style={styles.emptyText}>まだゲームをプレイしていません</Text>
            </View>
          ) : (
            recentGames.map((game) => (
              <View key={game.id} style={styles.gameHistoryItem}>
                <View style={styles.gameInfo}>
                  <Text style={styles.gameType}>{getGameTypeDisplay(game.gameType)}</Text>
                  <Text style={styles.gameDate}>
                    {new Date(game.timestamp).toLocaleDateString('ja-JP')}
                  </Text>
                </View>
                <View style={styles.gameResult}>
                  <Text style={[
                    styles.gameScore,
                    { color: game.score > 0 ? '#10B981' : game.score < 0 ? '#EF4444' : '#F59E0B' }
                  ]}>
                    {game.score > 0 ? '+' : ''}{game.score}
                  </Text>
                  <Text style={[
                    styles.gameOutcome,
                    { 
                      color: game.result === 'win' ? '#10B981' : 
                             game.result === 'draw' ? '#F59E0B' : '#EF4444' 
                    }
                  ]}>
                    {game.result === 'win' ? '勝利' : game.result === 'draw' ? '引分' : '敗北'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* ログアウトボタン */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#EF4444" />
            <Text style={styles.logoutText}>ログアウト</Text>
          </TouchableOpacity>
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
  title: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 28,
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingTop: 20,
  },
  profileCard: {
    backgroundColor: '#1F2937',
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  profileInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  userName: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  rankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rankBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
  },
  rankText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  rankPoints: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FF6B35',
  },
  profileStatus: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  joinDate: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  editForm: {
    width: '100%',
    marginTop: 16,
  },
  nameInput: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  visibilityToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  visibilityText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 14,
    marginLeft: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#6B7280',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#10B981',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1F2937',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statValue: {
    fontFamily: 'Inter-Bold',
    fontSize: 24,
    color: '#FFFFFF',
    marginTop: 8,
  },
  statLabel: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
  },
  progressCard: {
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
  progressGradient: {
    padding: 20,
  },
  progressTitle: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 12,
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
  historySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  emptyHistory: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 16,
    color: '#6B7280',
  },
  gameHistoryItem: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gameInfo: {
    flex: 1,
  },
  gameType: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 14,
    color: '#FFFFFF',
  },
  gameDate: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  gameResult: {
    alignItems: 'flex-end',
  },
  gameScore: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
  },
  gameOutcome: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 12,
    marginTop: 2,
  },
  logoutSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  logoutText: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 8,
  },
  loginPrompt: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 18,
    color: '#9CA3AF',
  },
  bottomPadding: {
    height: 40,
  },
});