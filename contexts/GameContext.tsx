import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, GameResult, Battle, RankInfo, RankTier } from '@/types/game';

interface GameContextType {
  currentUser: User | null;
  users: User[];
  gameHistory: GameResult[];
  battles: Battle[];
  isLoading: boolean;
  setCurrentUser: (user: User | null) => void;
  updateUserProfile: (updates: Partial<User>) => void;
  addGameResult: (result: GameResult) => void;
  createBattle: (playerIds: string[], gameType: string) => Battle;
  updateBattle: (battleId: string, updates: Partial<Battle>) => void;
  getRankInfo: (averageScore: number) => RankInfo;
  getTopPlayers: (limit?: number) => User[];
  loginWithLine: () => Promise<void>;
  logout: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [gameHistory, setGameHistory] = useState<GameResult[]>([]);
  const [battles, setBattles] = useState<Battle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // サンプルユーザーデータの初期化
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);
      
      const sampleUsers: User[] = [
        {
          id: '1',
          name: 'サイコロキング',
          avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          lineUserId: 'line_user_001',
          totalScore: 15420,
          matchesPlayed: 156,
          averageScore: 98.8,
          rank: 'グランドマスター',
          isOnline: true,
          profilePublic: true,
          winRate: 78.2,
          createdAt: new Date('2024-01-15'),
          lastLoginAt: new Date(),
        },
        {
          id: '2',
          name: 'ラッキーローラー',
          avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          lineUserId: 'line_user_002',
          totalScore: 12340,
          matchesPlayed: 134,
          averageScore: 92.1,
          rank: 'マスター',
          isOnline: true,
          profilePublic: true,
          winRate: 72.4,
          createdAt: new Date('2024-02-01'),
          lastLoginAt: new Date(),
        },
        {
          id: '3',
          name: 'サイコロ忍者',
          avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          lineUserId: 'line_user_003',
          totalScore: 9876,
          matchesPlayed: 112,
          averageScore: 88.2,
          rank: 'ダイヤモンド',
          isOnline: false,
          profilePublic: true,
          winRate: 68.8,
          createdAt: new Date('2024-02-15'),
          lastLoginAt: new Date(Date.now() - 86400000),
        },
        {
          id: '4',
          name: 'チンチロマスター',
          avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          lineUserId: 'line_user_004',
          totalScore: 8765,
          matchesPlayed: 98,
          averageScore: 89.4,
          rank: 'ダイヤモンド',
          isOnline: true,
          profilePublic: true,
          winRate: 71.4,
          createdAt: new Date('2024-03-01'),
          lastLoginAt: new Date(),
        },
        {
          id: '5',
          name: '丁半プロ',
          avatar: 'https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
          lineUserId: 'line_user_005',
          totalScore: 7234,
          matchesPlayed: 87,
          averageScore: 83.2,
          rank: 'プラチナ',
          isOnline: true,
          profilePublic: true,
          winRate: 65.5,
          createdAt: new Date('2024-03-10'),
          lastLoginAt: new Date(),
        },
      ];

      // 現在のユーザーを最初のユーザーに設定
      const currentUserData = sampleUsers[0];
      setCurrentUser(currentUserData);
      setUsers(sampleUsers);
      
      setIsLoading(false);
    };

    initializeData();
  }, []);

  const updateUserProfile = (updates: Partial<User>) => {
    if (!currentUser) return;
    
    const updatedUser = { ...currentUser, ...updates };
    setCurrentUser(updatedUser);
    
    setUsers(prev => prev.map(user => 
      user.id === currentUser.id ? updatedUser : user
    ));
  };

  const addGameResult = (result: GameResult) => {
    setGameHistory(prev => [result, ...prev]);
    
    if (currentUser) {
      const newTotalScore = currentUser.totalScore + result.score;
      const newMatchCount = currentUser.matchesPlayed + 1;
      const newAverageScore = newTotalScore / newMatchCount;
      
      // 勝率の計算
      const wins = gameHistory.filter(game => game.result === 'win').length + (result.result === 'win' ? 1 : 0);
      const newWinRate = (wins / newMatchCount) * 100;
      
      updateUserProfile({
        totalScore: newTotalScore,
        matchesPlayed: newMatchCount,
        averageScore: newAverageScore,
        rank: getRankInfo(newAverageScore).tier,
        winRate: newWinRate,
        lastLoginAt: new Date(),
      });
    }
  };

  const createBattle = (playerIds: string[], gameType: string): Battle => {
    const battle: Battle = {
      id: Date.now().toString(),
      players: users.filter(user => playerIds.includes(user.id)),
      gameType: gameType as any,
      status: 'waiting',
      currentRound: 1,
      maxRounds: 5,
      results: {},
      createdAt: new Date(),
    };
    
    setBattles(prev => [battle, ...prev]);
    return battle;
  };

  const updateBattle = (battleId: string, updates: Partial<Battle>) => {
    setBattles(prev => prev.map(battle => 
      battle.id === battleId ? { ...battle, ...updates } : battle
    ));
  };

  const getRankInfo = (averageScore: number): RankInfo => {
    if (averageScore >= 95) {
      return {
        tier: 'グランドマスター',
        division: 1,
        points: Math.floor(averageScore),
        nextTierPoints: 100,
        icon: '👑',
        color: '#FF6B35',
        gradient: ['#FF6B35', '#F7931E'],
      };
    } else if (averageScore >= 85) {
      return {
        tier: 'マスター',
        division: Math.floor((95 - averageScore) / 2) + 1,
        points: Math.floor(averageScore),
        nextTierPoints: 95,
        icon: '💎',
        color: '#8B5CF6',
        gradient: ['#8B5CF6', '#3B82F6'],
      };
    } else if (averageScore >= 75) {
      return {
        tier: 'ダイヤモンド',
        division: Math.floor((85 - averageScore) / 2) + 1,
        points: Math.floor(averageScore),
        nextTierPoints: 85,
        icon: '💠',
        color: '#06B6D4',
        gradient: ['#06B6D4', '#0891B2'],
      };
    } else if (averageScore >= 65) {
      return {
        tier: 'プラチナ',
        division: Math.floor((75 - averageScore) / 2) + 1,
        points: Math.floor(averageScore),
        nextTierPoints: 75,
        icon: '⭐',
        color: '#10B981',
        gradient: ['#10B981', '#059669'],
      };
    } else if (averageScore >= 50) {
      return {
        tier: 'ゴールド',
        division: Math.floor((65 - averageScore) / 3) + 1,
        points: Math.floor(averageScore),
        nextTierPoints: 65,
        icon: '🥇',
        color: '#F59E0B',
        gradient: ['#F59E0B', '#D97706'],
      };
    } else if (averageScore >= 30) {
      return {
        tier: 'シルバー',
        division: Math.floor((50 - averageScore) / 4) + 1,
        points: Math.floor(averageScore),
        nextTierPoints: 50,
        icon: '🥈',
        color: '#6B7280',
        gradient: ['#6B7280', '#4B5563'],
      };
    } else {
      return {
        tier: 'ブロンズ',
        division: Math.floor((30 - averageScore) / 5) + 1,
        points: Math.floor(averageScore),
        nextTierPoints: 30,
        icon: '🥉',
        color: '#92400E',
        gradient: ['#92400E', '#78350F'],
      };
    }
  };

  const getTopPlayers = (limit = 100): User[] => {
    return [...users]
      .sort((a, b) => b.averageScore - a.averageScore)
      .slice(0, limit);
  };

  const loginWithLine = async (): Promise<void> => {
    // LINEログインのシミュレーション
    setIsLoading(true);
    
    // 実際の実装では、LINE SDK を使用してログイン処理を行う
    // const lineLoginResult = await LineLogin.login({
    //   scopes: ['profile', 'openid'],
    // });
    
    // シミュレーション用の遅延
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // サンプルユーザーでログイン
    const mockLineUser: User = {
      id: 'line_' + Date.now(),
      name: 'LINEユーザー',
      avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      lineUserId: 'line_user_new',
      totalScore: 0,
      matchesPlayed: 0,
      averageScore: 0,
      rank: 'ブロンズ',
      isOnline: true,
      profilePublic: true,
      winRate: 0,
      createdAt: new Date(),
      lastLoginAt: new Date(),
    };
    
    setCurrentUser(mockLineUser);
    setUsers(prev => [mockLineUser, ...prev]);
    setIsLoading(false);
  };

  const logout = () => {
    setCurrentUser(null);
    setGameHistory([]);
  };

  return (
    <GameContext.Provider
      value={{
        currentUser,
        users,
        gameHistory,
        battles,
        isLoading,
        setCurrentUser,
        updateUserProfile,
        addGameResult,
        createBattle,
        updateBattle,
        getRankInfo,
        getTopPlayers,
        loginWithLine,
        logout,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}