import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

interface CustomizationWarningBannerProps {
  remaining: number;
  onUpgrade: () => void;
}

export default function CustomizationWarningBanner({
  remaining,
  onUpgrade,
}: CustomizationWarningBannerProps) {
  if (remaining !== 1) return null;

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={onUpgrade}
      activeOpacity={0.8}
    >
      <View style={styles.iconContainer}>
        <Ionicons name="warning" size={22} color="#F5A623" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>Only 1 Customization Left!</Text>
        <Text style={styles.subtitle}>
          Upgrade to PathForward Pro for unlimited refinements
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#F5A623" />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF8E6',
    borderLeftWidth: 4,
    borderLeftColor: '#F5A623',
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: '#D68910',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 13,
    color: '#A67C00',
    lineHeight: 18,
  },
});
