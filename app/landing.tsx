import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

const isWeb = Platform.OS === 'web';

// Animated Section Component
const AnimatedSection = ({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay, fadeAnim, slideAnim]);

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      {children}
    </Animated.View>
  );
};

// Feature Card Component
const FeatureCard = ({
  icon,
  title,
  description,
  delay,
}: {
  icon: string;
  title: string;
  description: string;
  delay: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleHoverIn = () => {
    setIsHovered(true);
    Animated.spring(scaleAnim, {
      toValue: 1.05,
      useNativeDriver: true,
    }).start();
  };

  const handleHoverOut = () => {
    setIsHovered(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedSection delay={delay}>
      <Animated.View style={[styles.featureCard, { transform: [{ scale: scaleAnim }] }]}>
        <Pressable
          onHoverIn={isWeb ? handleHoverIn : undefined}
          onHoverOut={isWeb ? handleHoverOut : undefined}
          style={[styles.featureCardContent, isHovered && styles.featureCardHovered]}
        >
          <View style={styles.iconContainer}>
            <Ionicons name={icon as any} size={28} color={Colors.primary} />
          </View>
          <Text style={styles.featureTitle}>{title}</Text>
          <Text style={styles.featureDescription}>{description}</Text>
        </Pressable>
      </Animated.View>
    </AnimatedSection>
  );
};

// Step Component
const StepCard = ({
  number,
  title,
  description,
  delay,
}: {
  number: number;
  title: string;
  description: string;
  delay: number;
}) => {
  return (
    <AnimatedSection delay={delay}>
      <View style={styles.stepCard}>
        <View style={styles.stepNumber}>
          <Text style={styles.stepNumberText}>{number}</Text>
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{title}</Text>
          <Text style={styles.stepDescription}>{description}</Text>
        </View>
      </View>
    </AnimatedSection>
  );
};

export default function LandingPage() {
  const [scrollY] = useState(new Animated.Value(0));

  return (
    <View style={styles.container}>
      {/* Navigation Bar */}
      <View style={styles.navbar}>
        <View style={styles.navContent}>
          <Text style={styles.logo}>PathForward</Text>
          <Link href="/auth/login" asChild>
            <Pressable style={styles.loginButton}>
              <Text style={styles.loginButtonText}>Login</Text>
            </Pressable>
          </Link>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
        {/* Hero Section */}
        <LinearGradient colors={[Colors.background, '#FFFFFF']} style={styles.heroSection}>
          <AnimatedSection>
            <View style={styles.heroContent}>
              <Text style={styles.heroHeadline}>Your Career Transition, Reimagined.</Text>
              <Text style={styles.heroSubheadline}>
                PathForward uses AI to build personalized, multi-phase roadmaps that turn career
                confusion into professional success.
              </Text>

              {/* CTA Buttons */}
              <View style={styles.ctaContainer}>
                <Pressable style={styles.ctaButtonPrimary}>
                  <Ionicons name="logo-apple" size={18} color={Colors.white} />
                  <Text style={styles.ctaButtonText}>App Store</Text>
                </Pressable>
                <Pressable style={styles.ctaButtonSecondary}>
                  <Ionicons name="logo-google-playstore" size={18} color={Colors.primary} />
                  <Text style={styles.ctaButtonTextSecondary}>Google Play</Text>
                </Pressable>
              </View>

              {/* iPhone Mockup Placeholder */}
              <View style={styles.mockupContainer}>
                <View style={styles.phoneMockup}>
                  <View style={styles.phoneNotch} />
                  <View style={styles.phoneScreen}>
                    <View style={styles.mockupHeader}>
                      <Text style={styles.mockupHeaderText}>PathForward Dashboard</Text>
                    </View>
                    <View style={styles.mockupContent}>
                      <View style={styles.mockupCard}>
                        <Ionicons name="flag" size={20} color={Colors.success} />
                        <Text style={styles.mockupCardTitle}>Your First Milestone</Text>
                        <Text style={styles.mockupCardText}>AI-curated action plan for you</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          </AnimatedSection>
        </LinearGradient>

        {/* How it Works Section */}
        <View style={styles.section}>
          <AnimatedSection>
            <Text style={styles.sectionTitle}>How it Works</Text>
            <Text style={styles.sectionSubtitle}>
              Three simple steps to transform your career journey
            </Text>
          </AnimatedSection>

          <View style={styles.stepsContainer}>
            <StepCard
              number={1}
              title="The Brief"
              description="Tell PathForward where you are and where you want to go."
              delay={100}
            />
            <StepCard
              number={2}
              title="The Logic"
              description="Newell AI generates a 90, 180, or 365-day roadmap tailored to your specific goals."
              delay={200}
            />
            <StepCard
              number={3}
              title="The Action"
              description="Log daily progress, unlock badges, and stay on track with 24/7 AI coaching."
              delay={300}
            />
          </View>
        </View>

        {/* Core Features Section */}
        <LinearGradient colors={['#FFFFFF', Colors.background]} style={styles.section}>
          <AnimatedSection>
            <Text style={styles.sectionTitle}>Core Features</Text>
            <Text style={styles.sectionSubtitle}>
              Everything you need to succeed in your career transition
            </Text>
          </AnimatedSection>

          <View style={styles.featuresGrid}>
            <FeatureCard
              icon="map"
              title="Dynamic Roadmaps"
              description="Visualize your career journey across 6-10 personalized phases, each designed to move you closer to your goal."
              delay={100}
            />
            <FeatureCard
              icon="sparkles"
              title="AI Customization"
              description="Adapt your plan to specific niches and industries with intelligent recommendations powered by Newell AI."
              delay={200}
            />
            <FeatureCard
              icon="trending-up"
              title="Progress Tracking"
              description="Track daily streaks, unlock milestone badges, and celebrate every step forward on your journey."
              delay={300}
            />
          </View>
        </LinearGradient>

        {/* PathForward Pro Section */}
        <View style={styles.section}>
          <AnimatedSection>
            <Text style={styles.sectionTitle}>PathForward Pro</Text>
            <Text style={styles.sectionSubtitle}>
              Unlock the ultimate career transformation experience
            </Text>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <View style={styles.proCard}>
              <LinearGradient
                colors={[Colors.primary, '#5BA3F5']}
                style={styles.proCardGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="star" size={40} color={Colors.white} />
                <Text style={styles.proCardTitle}>Upgrade to Pro</Text>
                <Text style={styles.proCardDescription}>
                  Get unlimited AI customizations, priority access, and advanced resources
                </Text>

                <View style={styles.proFeatures}>
                  <View style={styles.proFeature}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                    <Text style={styles.proFeatureText}>Unlimited Customizations</Text>
                  </View>
                  <View style={styles.proFeature}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                    <Text style={styles.proFeatureText}>Priority AI Access</Text>
                  </View>
                  <View style={styles.proFeature}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                    <Text style={styles.proFeatureText}>Advanced Resource Library</Text>
                  </View>
                  <View style={styles.proFeature}>
                    <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
                    <Text style={styles.proFeatureText}>24/7 AI Coaching</Text>
                  </View>
                </View>

                <Pressable style={styles.proButton}>
                  <Text style={styles.proButtonText}>Upgrade Now</Text>
                  <Ionicons name="arrow-forward" size={18} color={Colors.primary} />
                </Pressable>
              </LinearGradient>
            </View>
          </AnimatedSection>
        </View>

        {/* Social Proof Section */}
        <LinearGradient colors={[Colors.background, '#FFFFFF']} style={styles.section}>
          <AnimatedSection>
            <Text style={styles.sectionTitle}>Join Thousands of Successful Transitions</Text>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>2,847</Text>
                <Text style={styles.statLabel}>Career transitions started this month</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>4.9★</Text>
                <Text style={styles.statLabel}>Average rating on App Store</Text>
              </View>
            </View>
          </AnimatedSection>

          {/* Testimonials */}
          <AnimatedSection delay={200}>
            <View style={styles.testimonialsContainer}>
              <View style={styles.testimonialCard}>
                <View style={styles.testimonialAvatar}>
                  <Text style={styles.testimonialAvatarText}>S</Text>
                </View>
                <Text style={styles.testimonialText}>
                  &ldquo;PathForward helped me transition from marketing to product management in just 90
                  days. The AI-powered roadmap was a game-changer!&rdquo;
                </Text>
                <Text style={styles.testimonialAuthor}>Sarah Chen, Product Manager</Text>
              </View>

              <View style={styles.testimonialCard}>
                <View style={styles.testimonialAvatar}>
                  <Text style={styles.testimonialAvatarText}>M</Text>
                </View>
                <Text style={styles.testimonialText}>
                  &ldquo;The daily progress tracking and milestone badges kept me motivated throughout
                  my entire career pivot. Highly recommended!&rdquo;
                </Text>
                <Text style={styles.testimonialAuthor}>Michael Rodriguez, UX Designer</Text>
              </View>
            </View>
          </AnimatedSection>
        </LinearGradient>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>PathForward</Text>
          <Text style={styles.footerText}>Your career transition, reimagined.</Text>

          <View style={styles.footerLinks}>
            <Link href="/auth/login" asChild>
              <Pressable>
                <Text style={styles.footerLink}>Login</Text>
              </Pressable>
            </Link>
            <Link href="/auth/signup" asChild>
              <Pressable>
                <Text style={styles.footerLink}>Sign Up</Text>
              </Pressable>
            </Link>
          </View>

          <Text style={styles.copyright}>© 2024 PathForward. All rights reserved.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  navbar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
    ...Platform.select({
      web: {
        position: 'fixed' as any,
      },
    }),
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.navy,
  },
  loginButton: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  loginButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
  },
  heroSection: {
    paddingVertical: isWeb ? 60 : 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: 1000,
    width: '100%',
    alignItems: 'center',
  },
  heroHeadline: {
    fontSize: isWeb ? 38 : 30,
    fontWeight: '700',
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: isWeb ? 46 : 38,
    maxWidth: 800,
  },
  heroSubheadline: {
    fontSize: isWeb ? 16 : 15,
    color: Colors.mediumGray,
    textAlign: 'center',
    marginBottom: 28,
    maxWidth: 600,
    lineHeight: 24,
  },
  ctaContainer: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 12,
    marginBottom: 40,
  },
  ctaButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.navy,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    minWidth: 180,
    justifyContent: 'center',
  },
  ctaButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
    minWidth: 180,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '600',
  },
  ctaButtonTextSecondary: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  mockupContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  phoneMockup: {
    width: isWeb ? 280 : 260,
    height: isWeb ? 560 : 520,
    backgroundColor: Colors.navy,
    borderRadius: 36,
    padding: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 32,
    elevation: 16,
  },
  phoneNotch: {
    width: 120,
    height: 30,
    backgroundColor: Colors.navy,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -60,
    zIndex: 10,
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: 32,
    overflow: 'hidden',
  },
  mockupHeader: {
    backgroundColor: Colors.white,
    padding: 16,
    paddingTop: 36,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  mockupHeaderText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.navy,
  },
  mockupContent: {
    padding: 16,
  },
  mockupCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  mockupCardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.navy,
    marginTop: 10,
  },
  mockupCardText: {
    fontSize: 12,
    color: Colors.mediumGray,
    marginTop: 3,
  },
  section: {
    paddingVertical: isWeb ? 60 : 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: isWeb ? 32 : 26,
    fontWeight: '700',
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: isWeb ? 40 : 34,
    maxWidth: 800,
  },
  sectionSubtitle: {
    fontSize: 15,
    color: Colors.mediumGray,
    textAlign: 'center',
    marginBottom: 40,
    maxWidth: 600,
    lineHeight: 22,
  },
  stepsContainer: {
    maxWidth: 720,
    width: '100%',
    gap: 28,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumber: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 19,
    fontWeight: '600',
    color: Colors.navy,
    marginBottom: 6,
    lineHeight: 26,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.mediumGray,
    lineHeight: 21,
  },
  featuresGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: 20,
    maxWidth: 1000,
    width: '100%',
    justifyContent: 'center',
  },
  featureCard: {
    width: isWeb ? 310 : '100%',
  },
  featureCardContent: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  featureCardHovered: {
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 6,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.navy,
    marginBottom: 10,
    lineHeight: 24,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.mediumGray,
    lineHeight: 21,
  },
  proCard: {
    maxWidth: 680,
    width: '100%',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 10,
  },
  proCardGradient: {
    padding: isWeb ? 40 : 32,
    alignItems: 'center',
  },
  proCardTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 12,
    marginBottom: 6,
    lineHeight: 34,
  },
  proCardDescription: {
    fontSize: 15,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 28,
    opacity: 0.92,
    lineHeight: 22,
    maxWidth: 500,
  },
  proFeatures: {
    width: '100%',
    gap: 14,
    marginBottom: 28,
  },
  proFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  proFeatureText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '500',
  },
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  proButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 20,
    maxWidth: 800,
    width: '100%',
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 28,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  statNumber: {
    fontSize: 40,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 6,
    lineHeight: 48,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.mediumGray,
    textAlign: 'center',
    lineHeight: 20,
  },
  testimonialsContainer: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 20,
    maxWidth: 800,
    width: '100%',
  },
  testimonialCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  testimonialAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  testimonialAvatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  testimonialText: {
    fontSize: 14,
    color: Colors.navy,
    lineHeight: 21,
    marginBottom: 12,
  },
  testimonialAuthor: {
    fontSize: 13,
    color: Colors.mediumGray,
    fontWeight: '500',
  },
  footer: {
    backgroundColor: Colors.navy,
    paddingVertical: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerLogo: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 6,
  },
  footerText: {
    fontSize: 14,
    color: Colors.lightGray,
    marginBottom: 20,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 20,
  },
  footerLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '500',
  },
  copyright: {
    fontSize: 13,
    color: Colors.mediumGray,
  },
});
