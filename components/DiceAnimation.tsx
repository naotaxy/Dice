import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  Easing,
  runOnJS
} from 'react-native-reanimated';

interface DiceAnimationProps {
  value: number;
  isRolling: boolean;
  size?: number;
  onRollComplete?: () => void;
}

export function DiceAnimation({ value, isRolling, size = 60, onRollComplete }: DiceAnimationProps) {
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (isRolling) {
      // 回転アニメーション
      rotateX.value = withRepeat(
        withTiming(360, { duration: 100, easing: Easing.linear }),
        -1,
        false
      );
      rotateY.value = withRepeat(
        withTiming(360, { duration: 150, easing: Easing.linear }),
        -1,
        false
      );
      
      // スケールアニメーション
      scale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 100 }),
          withTiming(0.9, { duration: 100 }),
          withTiming(1.1, { duration: 100 }),
          withTiming(1, { duration: 100 })
        ),
        -1,
        true
      );

      // 透明度アニメーション
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.7, { duration: 200 }),
          withTiming(1, { duration: 200 })
        ),
        -1,
        true
      );
    } else {
      // アニメーション停止
      rotateX.value = withTiming(0, { duration: 300 });
      rotateY.value = withTiming(0, { duration: 300 });
      scale.value = withTiming(1, { duration: 300 });
      opacity.value = withTiming(1, { duration: 300 }, () => {
        if (onRollComplete) {
          runOnJS(onRollComplete)();
        }
      });
    }
  }, [isRolling]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const getDiceFace = (value: number) => {
    const dots = [];
    const dotSize = size * 0.12;
    
    for (let i = 0; i < value; i++) {
      dots.push(
        <View
          key={i}
          style={[
            styles.dot,
            getDotPosition(value, i),
            { 
              width: dotSize, 
              height: dotSize,
              borderRadius: dotSize / 2,
            }
          ]}
        />
      );
    }
    return dots;
  };

  const getDotPosition = (value: number, index: number) => {
    const positions = {
      1: [{ top: '40%', left: '40%' }],
      2: [
        { top: '20%', left: '20%' },
        { bottom: '20%', right: '20%' }
      ],
      3: [
        { top: '15%', left: '15%' },
        { top: '40%', left: '40%' },
        { bottom: '15%', right: '15%' }
      ],
      4: [
        { top: '20%', left: '20%' },
        { top: '20%', right: '20%' },
        { bottom: '20%', left: '20%' },
        { bottom: '20%', right: '20%' }
      ],
      5: [
        { top: '15%', left: '15%' },
        { top: '15%', right: '15%' },
        { top: '40%', left: '40%' },
        { bottom: '15%', left: '15%' },
        { bottom: '15%', right: '15%' }
      ],
      6: [
        { top: '15%', left: '20%' },
        { top: '15%', right: '20%' },
        { top: '40%', left: '20%' },
        { top: '40%', right: '20%' },
        { bottom: '15%', left: '20%' },
        { bottom: '15%', right: '20%' }
      ]
    };
    return positions[value as keyof typeof positions]?.[index] || {};
  };

  return (
    <Animated.View
      style={[
        styles.dice,
        {
          width: size,
          height: size,
          borderRadius: size * 0.15,
        },
        animatedStyle,
      ]}
    >
      {getDiceFace(value)}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  dice: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  dot: {
    backgroundColor: '#1F2937',
    position: 'absolute',
  },
});