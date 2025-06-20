import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';

interface GameCardProps {
  title: string;
  description: string;
  image: string;
  onPress: () => void;
  gradient: string[];
  difficulty?: string;
  playerCount?: string;
}

export function GameCard({ 
  title, 
  description, 
  image, 
  onPress, 
  gradient, 
  difficulty,
  playerCount 
}: GameCardProps) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container} activeOpacity={0.8}>
      <LinearGradient colors={gradient} style={styles.gradient}>
        <View style={styles.content}>
          <Image source={{ uri: image }} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.description}>{description}</Text>
            {(difficulty || playerCount) && (
              <View style={styles.metaContainer}>
                {difficulty && (
                  <View style={styles.metaTag}>
                    <Text style={styles.metaText}>{difficulty}</Text>
                  </View>
                )}
                {playerCount && (
                  <View style={styles.metaTag}>
                    <Text style={styles.metaText}>{playerCount}</Text>
                  </View>
                )}
              </View>
            )}
          </View>
          <ChevronRight size={24} color="#FFFFFF" style={styles.arrow} />
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  gradient: {
    borderRadius: 20,
    padding: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontFamily: 'NotoSansJP-Bold',
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 6,
  },
  description: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 14,
    color: '#E5E7EB',
    lineHeight: 20,
    marginBottom: 8,
  },
  metaContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  metaTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  metaText: {
    fontFamily: 'NotoSansJP-Regular',
    fontSize: 12,
    color: '#FFFFFF',
  },
  arrow: {
    opacity: 0.8,
  },
});