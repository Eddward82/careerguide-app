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
            <Ionicons name={icon as any} size={32} color={Colors.primary} />
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
                  <Ionicons name="logo-apple" size={20} color={Colors.white} />
                  <Text style={styles.ctaButtonText}>App Store</Text>
                </Pressable>
                <Pressable style={styles.ctaButtonSecondary}>
                  <Ionicons name="logo-google-playstore" size={20} color={Colors.primary} />
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
                        <Ionicons name="flag" size={24} color={Colors.success} />
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
                <Ionicons name="star" size={48} color={Colors.white} />
                <Text style={styles.proCardTitle}>Upgrade to Pro</Text>
                <Text style={styles.proCardDescription}>
                  Get unlimited AI customizations, priority access, and advanced resources
                </Text>

                <View style={styles.proFeatures}>
                  <View style={styles.proFeature}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    <Text style={styles.proFeatureText}>Unlimited Customizations</Text>
                  </View>
                  <View style={styles.proFeature}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    <Text style={styles.proFeatureText}>Priority AI Access</Text>
                  </View>
                  <View style={styles.proFeature}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    <Text style={styles.proFeatureText}>Advanced Resource Library</Text>
                  </View>
                  <View style={styles.proFeature}>
                    <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
                    <Text style={styles.proFeatureText}>24/7 AI Coaching</Text>
                  </View>
                </View>

                <Pressable style={styles.proButton}>
                  <Text style={styles.proButtonText}>Upgrade Now</Text>
                  <Ionicons name="arrow-forward" size={20} color={Colors.primary} />
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
    paddingVertical: 16,
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
  },
  logo: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.navy,
  },
  loginButton: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  loginButtonText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 60,
  },
  heroSection: {
    paddingVertical: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  heroContent: {
    maxWidth: 1200,
    width: '100%',
    alignItems: 'center',
  },
  heroHeadline: {
    fontSize: isWeb ? 56 : 40,
    fontWeight: '700',
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: isWeb ? 64 : 48,
  },
  heroSubheadline: {
    fontSize: isWeb ? 20 : 18,
    color: Colors.mediumGray,
    textAlign: 'center',
    marginBottom: 32,
    maxWidth: 700,
    lineHeight: 28,
  },
  ctaContainer: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 16,
    marginBottom: 60,
  },
  ctaButtonPrimary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.navy,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    minWidth: 200,
    justifyContent: 'center',
  },
  ctaButtonSecondary: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    minWidth: 200,
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  ctaButtonText: {
    color: Colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  ctaButtonTextSecondary: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  mockupContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  phoneMockup: {
    width: isWeb ? 320 : 280,
    height: isWeb ? 650 : 570,
    backgroundColor: Colors.navy,
    borderRadius: 40,
    padding: 12,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
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
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  mockupHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.navy,
  },
  mockupContent: {
    padding: 20,
  },
  mockupCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mockupCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.navy,
    marginTop: 12,
  },
  mockupCardText: {
    fontSize: 14,
    color: Colors.mediumGray,
    marginTop: 4,
  },
  section: {
    paddingVertical: 80,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: isWeb ? 42 : 32,
    fontWeight: '700',
    color: Colors.navy,
    textAlign: 'center',
    marginBottom: 16,
  },
  sectionSubtitle: {
    fontSize: 18,
    color: Colors.mediumGray,
    textAlign: 'center',
    marginBottom: 48,
    maxWidth: 600,
  },
  stepsContainer: {
    maxWidth: 800,
    width: '100%',
    gap: 32,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 20,
  },
  stepNumber: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.navy,
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 16,
    color: Colors.mediumGray,
    lineHeight: 24,
  },
  featuresGrid: {
    flexDirection: isWeb ? 'row' : 'column',
    flexWrap: 'wrap',
    gap: 24,
    maxWidth: 1200,
    width: '100%',
    justifyContent: 'center',
  },
  featureCard: {
    width: isWeb ? 360 : '100%',
  },
  featureCardContent: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 32,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: Colors.lightGray,
  },
  featureCardHovered: {
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${Colors.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  featureTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.navy,
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 16,
    color: Colors.mediumGray,
    lineHeight: 24,
  },
  proCard: {
    maxWidth: 800,
    width: '100%',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 12,
  },
  proCardGradient: {
    padding: 48,
    alignItems: 'center',
  },
  proCardTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 16,
    marginBottom: 8,
  },
  proCardDescription: {
    fontSize: 18,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.9,
  },
  proFeatures: {
    width: '100%',
    gap: 16,
    marginBottom: 32,
  },
  proFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  proFeatureText: {
    fontSize: 16,
    color: Colors.white,
    fontWeight: '500',
  },
  proButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  proButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 24,
    maxWidth: 1000,
    width: '100%',
    marginBottom: 48,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  statNumber: {
    fontSize: 48,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 16,
    color: Colors.mediumGray,
    textAlign: 'center',
  },
  testimonialsContainer: {
    flexDirection: isWeb ? 'row' : 'column',
    gap: 24,
    maxWidth: 1000,
    width: '100%',
  },
  testimonialCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 32,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  testimonialAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  testimonialAvatarText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
  },
  testimonialText: {
    fontSize: 16,
    color: Colors.navy,
    lineHeight: 24,
    marginBottom: 16,
  },
  testimonialAuthor: {
    fontSize: 14,
    color: Colors.mediumGray,
    fontWeight: '500',
  },
  footer: {
    backgroundColor: Colors.navy,
    paddingVertical: 48,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  footerLogo: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 8,
  },
  footerText: {
    fontSize: 16,
    color: Colors.lightGray,
    marginBottom: 24,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 24,
  },
  footerLink: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '500',
  },
  copyright: {
    fontSize: 14,
    color: Colors.mediumGray,
  },
});
