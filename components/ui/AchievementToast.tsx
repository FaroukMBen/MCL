import { IconSymbol } from '@/components/ui/icon-symbol';
import { AchievementNotification, RARITY_COLORS, RARITY_LABELS, useStore } from '@/store/useStore';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function AchievementToast() {
  const pendingNotifications = useStore((state) => state.pendingNotifications);
  const dismissNotification = useStore((state) => state.dismissNotification);
  const [currentNotification, setCurrentNotification] = useState<AchievementNotification | null>(null);
  const slideAnim = useRef(new Animated.Value(-200)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (pendingNotifications.length > 0 && !currentNotification) {
      const notif = pendingNotifications[0];
      setCurrentNotification(notif);

      // Slide in
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto dismiss after 4 seconds
      const timer = setTimeout(() => {
        handleDismiss(notif.id);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [pendingNotifications, currentNotification]);

  const handleDismiss = (id: string) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      dismissNotification(id);
      setCurrentNotification(null);
      slideAnim.setValue(-200);
      opacityAnim.setValue(0);
    });
  };

  if (!currentNotification) return null;

  const { achievement } = currentNotification;
  const rarityColor = RARITY_COLORS[achievement.rarity];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={[styles.toast, { borderLeftColor: rarityColor }]}
        onPress={() => handleDismiss(currentNotification.id)}
        activeOpacity={0.9}
      >
        <View style={[styles.iconContainer, { backgroundColor: rarityColor }]}>
          <IconSymbol name={achievement.icon as any} size={28} color="#fff" />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.unlocked}>SUCCÈS DÉBLOQUÉ !</Text>
          <Text style={styles.title}>{achievement.title}</Text>
          <Text style={styles.description}>{achievement.description}</Text>
          <View style={styles.rewardRow}>
            <Text style={[styles.rarityBadge, { color: rarityColor }]}>
              {RARITY_LABELS[achievement.rarity]}
            </Text>
            <Text style={styles.xpReward}>+{achievement.xpReward} XP</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 999,
  },
  toast: {
    flexDirection: 'row',
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
  },
  unlocked: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#ffd700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  description: {
    fontSize: 13,
    color: '#aaa',
    marginBottom: 6,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rarityBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  xpReward: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#4caf50',
  },
});
