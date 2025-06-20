export interface User {
  id: string;
  name: string;
  avatar: string;
  lineUserId?: string;
  totalScore: number;
  matchesPlayed: number;
  averageScore: number;
  rank: RankTier;
  isOnline: boolean;
  profilePublic: boolean;
  winRate: number;
  createdAt: Date;
  lastLoginAt: Date;
}

export interface GameResult {
  id: string;
  gameType: 'sicbo' | 'chinchirorin' | 'chohan';
  dice: number[];
  bet: string;
  score: number;
  timestamp: Date;
  result: 'win' | 'lose' | 'draw';
  multiplier?: number;
}

export interface Battle {
  id: string;
  players: User[];
  gameType: 'sicbo' | 'chinchirorin' | 'chohan';
  status: 'waiting' | 'active' | 'completed' | 'cancelled';
  currentRound: number;
  maxRounds: number;
  results: { [userId: string]: GameResult[] };
  winner?: string;
  createdAt: Date;
  startedAt?: Date;
  completedAt?: Date;
}

export interface DiceRoll {
  dice: number[];
  isRolling: boolean;
  result?: string;
  score: number;
}

export type RankTier = 'ブロンズ' | 'シルバー' | 'ゴールド' | 'プラチナ' | 'ダイヤモンド' | 'マスター' | 'グランドマスター';

export interface RankInfo {
  tier: RankTier;
  division: number;
  points: number;
  nextTierPoints: number;
  icon: string;
  color: string;
  gradient: string[];
}

export interface LineLoginConfig {
  channelId: string;
  scope: string[];
  redirectUri: string;
}