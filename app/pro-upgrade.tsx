import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import { getOfferings, purchasePackage } from '@/utils/revenueCat';
import type { PurchasesPackage } from 'react-native-purchases';

interface Feature {
  name: string;
  free: string | boolean;
  pro: string | boolean;
}

const features: Feature[] = [
  { name: 'Standard Onboarding', free: true, pro: true },
  { name: 'AI-Powered Roadmap (3-10 phases)', free: true, pro: true },
  { name: 'Roadmap Customizations', free: '5 lifetime', pro: 'Unlimited' },
  { name: 'Standard Resources & Guides', free: true, pro: true },
  { name: 'Daily Action Plan', free: true, pro: true },
  { name: 'Priority AI Coaching', free: false, pro: true },
  { name: 'Advanced Resource Matching', free: false, pro: true },
  { name: 'Cloud Sync & Backup', free: false, pro: true },
  { name: 'Early Access to New Features', free: false, pro: true },
];

export default function ProUpgradeScreen() {
  const router = useRouter();
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<PurchasesPackage | null>(null);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      setLoading(true);
      const availablePackages = await getOfferings();
      setPackages(availablePackages);

      // Auto-select monthly package if available
      const monthly = availablePackages.find(pkg =>
        pkg.identifier.includes('monthly') || pkg.identifier.includes('$rc_monthly')
      );
      if (monthly) {
        setSelectedPackage(monthly);
      } else if (availablePackages.length > 0) {
        setSelectedPackage(availablePackages[0]);
      }
    } catch (error) {
      console.error('Failed to load offerings:', error);
      Alert.alert('Error', 'Failed to load subscription plans. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!selectedPackage) {
      Alert.alert('Error', 'Please select a subscription plan');
      return;
    }

    try {
      setPurchasing(true);
      const result = await purchasePackage(selectedPackage);

      if (result.success && result.isPro) {
        Alert.alert(
          '🎉 Welcome to Pro!',
          'You now have unlimited access to all premium features.',
          [
            {
              text: 'Get Started',
              onPress: () => router.back(),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      Alert.alert('Purchase Failed', 'Something went wrong. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const renderFeatureIcon = (value: string | boolean) => {
    if (value === true) {
      return <Ionicons name="checkmark-circle" size={22} color="#50E3C2" />;
    }
    if (value === false) {
      return <Ionicons name="close-circle" size={22} color="#E0E0E0" />;
    }
    return <Text style={styles.featureValue}>{value}</Text>;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Header with Gradient */}
      <LinearGradient
        colors={['#1A2332', '#2A3847']}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade to Pro</Text>
        <View style={styles.backButton} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.proIconContainer}>
            <LinearGradient
              colors={['#4A90E2', '#357ABD']}
              style={styles.proIconGradient}
            >
              <Ionicons name="star" size={40} color={Colors.white} />
            </LinearGradient>
          </View>
          <Text style={styles.heroTitle}>Unlock Unlimited Potential</Text>
          <Text style={styles.heroSubtitle}>
            Get unlimited roadmap customizations and premium features to accelerate your career transition
          </Text>
        </View>

        {/* Package Selection */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>Loading plans...</Text>
          </View>
        ) : packages.length > 0 ? (
          <View style={styles.packagesSection}>
            <Text style={styles.sectionTitle}>Choose Your Plan</Text>
            {packages.map((pkg) => {
              const isSelected = selectedPackage?.identifier === pkg.identifier;
              const isAnnual = pkg.identifier.includes('annual') || pkg.identifier.includes('$rc_annual');

              return (
                <TouchableOpacity
                  key={pkg.identifier}
                  style={[
                    styles.packageCard,
                    isSelected && styles.packageCardSelected,
                  ]}
                  onPress={() => setSelectedPackage(pkg)}
                  activeOpacity={0.7}
                >
                  {isAnnual && (
                    <View style={styles.savingsBadge}>
                      <Text style={styles.savingsBadgeText}>BEST VALUE</Text>
                    </View>
                  )}
                  <View style={styles.packageContent}>
                    <View style={styles.packageInfo}>
                      <Text style={styles.packageTitle}>
                        {pkg.product.title}
                      </Text>
                      <Text style={styles.packagePrice}>
                        {pkg.product.priceString}
                        {isAnnual && (
                          <Text style={styles.packagePricePeriod}> /year</Text>
                        )}
                        {!isAnnual && (
                          <Text style={styles.packagePricePeriod}> /month</Text>
                        )}
                      </Text>
                    </View>
                    <View style={[
                      styles.radioButton,
                      isSelected && styles.radioButtonSelected,
                    ]}>
                      {isSelected && <View style={styles.radioButtonInner} />}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {/* Feature Comparison Table */}
        <View style={styles.comparisonSection}>
          <Text style={styles.sectionTitle}>Free vs Pro Comparison</Text>

          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderFeature}>Feature</Text>
            <Text style={styles.tableHeaderPlan}>Free</Text>
            <Text style={styles.tableHeaderPlan}>Pro</Text>
          </View>

          {features.map((feature, index) => (
            <View
              key={index}
              style={[
                styles.tableRow,
                index % 2 === 0 && styles.tableRowEven,
              ]}
            >
              <Text style={styles.featureName}>{feature.name}</Text>
              <View style={styles.featureCell}>
                {renderFeatureIcon(feature.free)}
              </View>
              <View style={styles.featureCell}>
                {renderFeatureIcon(feature.pro)}
              </View>
            </View>
          ))}
        </View>

        {/* Additional Benefits */}
        <View style={styles.benefitsSection}>
          <Text style={styles.sectionTitle}>Why Go Pro?</Text>

          <View style={styles.benefitCard}>
            <View style={styles.benefitIconContainer}>
              <Ionicons name="infinite" size={28} color="#4A90E2" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Unlimited Customizations</Text>
              <Text style={styles.benefitDescription}>
                Refine your roadmap as many times as you need without restrictions
              </Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={styles.benefitIconContainer}>
              <Ionicons name="flash" size={28} color="#4A90E2" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Priority AI Processing</Text>
              <Text style={styles.benefitDescription}>
                Get faster, more detailed AI coaching and recommendations
              </Text>
            </View>
          </View>

          <View style={styles.benefitCard}>
            <View style={styles.benefitIconContainer}>
              <Ionicons name="cloud-upload" size={28} color="#4A90E2" />
            </View>
            <View style={styles.benefitContent}>
              <Text style={styles.benefitTitle}>Cloud Sync & Backup</Text>
              <Text style={styles.benefitDescription}>
                Never lose your progress - automatic cloud backup across devices
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom CTA */}
      {!loading && selectedPackage && (
        <View style={styles.bottomBar}>
          <TouchableOpacity
            style={styles.purchaseButton}
            onPress={handlePurchase}
            disabled={purchasing}
          >
            <LinearGradient
              colors={['#4A90E2', '#357ABD']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.purchaseGradient}
            >
              {purchasing ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <>
                  <Text style={styles.purchaseButtonText}>
                    Upgrade to Pro
                  </Text>
                  <Ionicons name="arrow-forward" size={20} color={Colors.white} />
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
          <Text style={styles.termsText}>
            Cancel anytime. Terms apply.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.white,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  heroSection: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: Colors.white,
    marginBottom: 24,
  },
  proIconContainer: {
    marginBottom: 20,
  },
  proIconGradient: {
    width: 88,
    height: 88,
    borderRadius: 44,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 5,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    color: Colors.mediumGray,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: Colors.mediumGray,
  },
  packagesSection: {
    padding: 24,
    backgroundColor: Colors.white,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 20,
  },
  packageCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.lightGray,
  },
  packageCardSelected: {
    borderColor: '#4A90E2',
    backgroundColor: '#F0F7FF',
  },
  savingsBadge: {
    position: 'absolute',
    top: -10,
    right: 20,
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.white,
    letterSpacing: 0.5,
  },
  packageContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  packageInfo: {
    flex: 1,
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 6,
  },
  packagePrice: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A90E2',
  },
  packagePricePeriod: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.mediumGray,
  },
  radioButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.mediumGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioButtonSelected: {
    borderColor: '#4A90E2',
  },
  radioButtonInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
  },
  comparisonSection: {
    padding: 24,
    backgroundColor: Colors.white,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: Colors.navy,
    marginBottom: 8,
  },
  tableHeaderFeature: {
    flex: 2,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableHeaderPlan: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: Colors.navy,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 14,
    alignItems: 'center',
  },
  tableRowEven: {
    backgroundColor: '#F8F9FA',
  },
  featureName: {
    flex: 2,
    fontSize: 14,
    color: Colors.navy,
    fontWeight: '500',
    paddingRight: 8,
  },
  featureCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureValue: {
    fontSize: 12,
    color: '#4A90E2',
    fontWeight: '600',
    textAlign: 'center',
  },
  benefitsSection: {
    padding: 24,
    backgroundColor: Colors.white,
  },
  benefitCard: {
    flexDirection: 'row',
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#F0F7FF',
    borderRadius: 12,
  },
  benefitIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.navy,
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: Colors.mediumGray,
    lineHeight: 20,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.lightGray,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  purchaseButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  purchaseGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  purchaseButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
  termsText: {
    fontSize: 12,
    color: Colors.mediumGray,
    textAlign: 'center',
  },
});
