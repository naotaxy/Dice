import React from 'react';
import { View, Image, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface UserAvatarProps {
  uri: string;
  size?: number;
  rank?: string;
  showRank?: boolean;
  isOnline?: boolean;
}

export function UserAvatar({ uri, size = 50, rank, showRank = false, isOnline = false }: UserAvatarProps) {
  const getRankColor = (rank?: string) => {
    switch (rank) {
      case 'グランドマスター': return ['#FF6B35', '#F7931E'];
      case 'マスター': return ['#8B5CF6', '#3B82F6'];
      case 'ダイヤモンド': return ['#06B6D4', '#0891B2'];
      case 'プラチナ': return ['#10B981', '#059669'];
      case 'ゴールド': return ['#F59E0B', '#D97706'];
      case 'シルバー': return ['#6B7280', '#4B5563'];
      default: return ['#92400E', '#78350F'];
    }
  };

  const getRankIcon = (rank?: string) => {
    switch (rank) {
      case 'グランドマスター': return '👑';
      case 'マスター': return '💎';
      case 'ダイヤモンド': return '💠';
      case 'プラチナ': return '⭐';
      case 'ゴールド': return '🥇';
      case 'シルバー': return '🥈';
      default: return '🥉';
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Image
        source={{ uri }}
        style={[
          styles.avatar,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: showRank ? 3 : 2,
          },
        ]}
      />
      
      {/* ランクバッジ */}
      {showRank && rank && (
        <LinearGradient
          colors={getRankColor(rank)}
          style={[
            styles.rankBadge,
            {
              width: size * 0.35,
              height: size * 0.35,
              borderRadius: (size * 0.35) / 2,
              bottom: -2,
              right: -2,
            },
          ]}
        >
          <Text style={[styles.rankIcon, { fontSize: size * 0.15 }]}>
            {getRankIcon(rank)}
          </Text>
        </LinearGradient>
      )}

      {/* オンライン状態インジケーター */}
      {isOnline && (
        <View
          style={[
            styles.onlineIndicator,
            {
              width: size * 0.25,
              height: size * 0.25,
              borderRadius: (size * 0.25) / 2,
              bottom: showRank && rank ? size * 0.1 : 2,
              right: showRank && rank ? size * 0.1 : 2,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: '#F3F4F6',
    borderColor: '#E5E7EB',
  },
  rankBadge: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  rankIcon: {
    textAlign: 'center',
  },
  onlineIndicator: {
    position: 'absolute',
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
});