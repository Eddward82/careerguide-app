import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { LinearGradient } from 'expo-linear-gradient';

interface PaywallModalProps {
  visible: boolean;
  customizationsUsed: number;
  customizationLimit: number;
  onUpgrade: () => void;
}

const { width } = Dimensions.get('window');

export default function PaywallModal({
  visible,
  customizationsUsed,
  customizationLimit,
  onUpgrade,
}: PaywallModalProps) {
  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header with Icon */}
          <View style={styles.iconContainer}>
            <LinearGradient
              colors={['#FF6B6B', '#FF8E53']}
              style={styles.iconGradient}
            >
              <Ionicons name="lock-closed" size={32} color={Colors.white} />
            </LinearGradient>
          </View>

          {/* Title */}
          <Text style={styles.title}>Customization Limit Reached</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>
            You&apos;ve used all {customizationLimit} free plan customizations
          </Text>

          {/* Progress Bar */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: '100%' }]} />
            </View>
            <Text style={styles.progressText}>
              {customizationsUsed}/{customizationLimit} used
            </Text>
          </View>

          {/* Benefits List */}
          <View style={styles.benefitsContainer}>
            <View style={styles.benefitRow}>
              <View style={styles.checkIconContainer}>
                <Ionicons name="checkmark-circle" size={22} color="#50E3C2" />
              </View>
              <Text style={styles.benefitText}>Unlimited Roadmap Customizations</Text>
            </View>
            <View style={styles.benefitRow}>
              <View style={styles.checkIconContainer}>
                <Ionicons name="checkmark-circle" size={22} color="#50E3C2" />
              </View>
              <Text style={styles.benefitText}>Priority AI Coaching</Text>
            </View>
            <View style={styles.benefitRow}>
              <View style={styles.checkIconContainer}>
                <Ionicons name="checkmark-circle" size={22} color="#50E3C2" />
              </View>
              <Text style={styles.benefitText}>Advanced Resource Matching</Text>
            </View>
            <View style={styles.benefitRow}>
              <View style={styles.checkIconContainer}>
                <Ionicons name="checkmark-circle" size={22} color="#50E3C2" />
              </View>
              <Text style={styles.benefitText}>Cloud Sync & Backup</Text>
            </View>
          </View>

          {/* CTA Button */}
          <TouchableOpacity style={styles.upgradeButton} onPress={onUpgrade}>
            <LinearGradient
              colors={['#4A90E2', '#357ABD']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.upgradeGradient}
            >
              <Ionicons name="star" size={20} color={Colors.white} />
              <Text style={styles.upgradeButtonText}>View Pro Plans</Text>
              <Ionicons name="arrow-forward" size={20} color={Colors.white} />
            </LinearGradient>
          </TouchableOpacity>

          {/* Info Text */}
          <Text style={styles.infoText}>
            Unlock unlimited customizations and premium features
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26, 35, 50, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: Math.min(width - 48, 400),
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 24,
    elevation: 10,
  },
  iconContainer: {
    marginBottom: 20,
  },
  iconGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: Colors.mediumGray,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  progressContainer: {
    width: '100%',
    marginBottom: 32,
  },
  progressBarBackground: {
    height: 10,
    backgroundColor: '#FFE5E5',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B6B',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 13,
    color: '#FF6B6B',
    fontWeight: '600',
    textAlign: 'center',
  },
  benefitsContainer: {
    width: '100%',
    marginBottom: 28,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  checkIconContainer: {
    marginRight: 12,
  },
  benefitText: {
    fontSize: 15,
    color: Colors.navy,
    fontWeight: '500',
    flex: 1,
  },
  upgradeButton: {
    width: '100%',
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  upgradeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    gap: 8,
  },
  upgradeButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  infoText: {
    fontSize: 13,
    color: Colors.mediumGray,
    textAlign: 'center',
    lineHeight: 18,
  },
});
