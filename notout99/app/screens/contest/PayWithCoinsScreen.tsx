import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Dimensions,
  Animated,
  Platform,
  Easing
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Award, Coins, Ticket } from 'lucide-react-native';
import { useAppSelector } from '@/app/store';
import { fetchCoinsOfUser } from '@/app/api/getapi/getApi';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from 'expo-router';

const { width, height } = Dimensions.get('window');

const PayWithCoinsScreen = () => {
  const router = useRouter();
  const { 
    contest_id, 
    match_id, 
    contest_name, 
    entry_fee, 
    total_prize 
  } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [userCoins, setUserCoins] = useState(0);
  const { userData } = useAppSelector((state) => state.user);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Animations
  const player1Animation = useRef(new Animated.Value(0)).current;
  const player2Animation = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;
  const buttonShimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadUserCoins();
    startEntryAnimations();
    startButtonShimmer();
  }, []);

  const startEntryAnimations = () => {
    player1Animation.setValue(0);
    player2Animation.setValue(0);
    cardOpacity.setValue(0);

    Animated.parallel([
      Animated.timing(player1Animation, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(player2Animation, {
        toValue: 1,
        duration: 800,
        delay: 100,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      })
    ]).start();
  };

  const startButtonShimmer = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(buttonShimmer, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(buttonShimmer, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleButtonPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      })
    ]).start(() => handlePayment());
  };

  useFocusEffect(
    React.useCallback(() => {
      loadUserCoins();
      return () => {};
    }, [])
  );

  const loadUserCoins = async () => {
    try {
      const coinsData = await fetchCoinsOfUser(userData._id);
      if (!coinsData.error) {
        setUserCoins(coinsData.balance);
      }
    } catch (error) {
      console.error('Error loading coins:', error);
      Alert.alert('Error', 'Failed to load coins balance');
    }
  };

  const handlePayment = async () => {
    if (!entry_fee || !userData._id) return;

    const requiredCoins = Number(entry_fee);
    if (userCoins < requiredCoins) {
      Alert.alert(
        'Insufficient Coins',
        'Not enough coins to join this contest. Top up your balance?',
        [
          {
            text: 'Add Coins',
            onPress: () => router.push('/screens/wallet/AddCash'),
          },
          { text: 'Cancel', style: 'cancel' },
        ],
        { cancelable: true }
      );
      return;
    }

    setIsLoading(true);
    try {
      // Deduct coins
      const response = await fetch(
        `${process.env.API_URL}/coins/${userData._id}/deduct`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: requiredCoins,
            description: `Contest entry fee for ${contest_name}`,
          }),
        }
      );

      const data = await response.json();
      
      if (!response.ok || data.error) {
        throw new Error(data.error || 'Payment failed');
      }

      // Navigate to team creation
      router.replace(`/screens/team/CreateTeam?match_id=${match_id}&contest_id=${contest_id}`);
    } catch (error: any) {
      Alert.alert('Payment Error', error.message || 'Failed to process payment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render loading state if data isn't ready
  if (!contest_name || !entry_fee || !total_prize) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e85d04" />
      </View>
    );
  }

  const shimmerTranslateX = buttonShimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-width * 0.8, width * 0.8],
  });

  return (
    <View style={styles.container}>
      <ImageBackground 
        source={require('@/assets/images/cricket-stadium.png')}
        style={styles.backgroundImage}
        resizeMode="cover"
        onLoadEnd={() => setIsImageLoaded(true)}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.9)']}
          style={styles.overlay}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <ArrowLeft color="#fff" size={26} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Confirm Entry</Text>
          </View>

          {isImageLoaded && (
            <View style={styles.content}>
              <View style={styles.playersContainer}>
                <Animated.Image
                  source={require('@/assets/images/player1.png')}
                  style={[
                    styles.playerImage,
                    {
                      transform: [
                        { translateX: player1Animation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-width * 0.3, 0]
                        })},
                      ],
                      opacity: player1Animation
                    }
                  ]}
                  resizeMode="contain"
                />
                <Animated.Image
                  source={require('@/assets/images/player2.png')}
                  style={[
                    styles.playerImage,
                    {
                      transform: [
                        { translateX: player2Animation.interpolate({
                          inputRange: [0, 1],
                          outputRange: [width * 0.3, 0]
                        })},
                      ],
                      opacity: player2Animation
                    }
                  ]}
                  resizeMode="contain"
                />
              </View>

              <Animated.View style={[styles.card, styles.contestInfo, { opacity: cardOpacity }]}>
                <Award color="#FFD700" size={24} style={styles.cardIcon} />
                <Text style={styles.contestName}>{contest_name}</Text>
                <Text style={styles.prizePoolLabel}>Total Prize Pool</Text>
                <Text style={styles.prizePool}>₹{total_prize}</Text>
              </Animated.View>

              <Animated.View style={[styles.card, styles.balanceCard, { opacity: cardOpacity }]}>
                <Coins color="#e85d04" size={24} style={styles.cardIcon} />
                <Text style={styles.balanceLabel}>Your Available Coins</Text>
                <Text style={styles.balanceText}>{userCoins}</Text>
              </Animated.View>

              <Animated.View style={[styles.card, styles.paymentDetails, { opacity: cardOpacity }]}>
                <Ticket color="#4CAF50" size={24} style={styles.cardIcon} />
                <Text style={styles.detailsTitle}>Entry Fee</Text>
                <Text style={styles.detailValue}>{entry_fee} Coins</Text>
                <Text style={styles.deductionNote}>
                  This amount will be deducted to join the contest.
                </Text>
              </Animated.View>

              <Animated.View style={[styles.buttonContainer, { transform: [{ scale: buttonScale }] }]}>
                <TouchableOpacity
                  style={styles.payButton}
                  onPress={handleButtonPress}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#FFA500', '#FF8C00', '#e85d04']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.payButtonText}>
                        PAY {entry_fee} COINS & JOIN
                      </Text>
                    )}
                    <Animated.View style={[styles.shimmerEffect, { transform: [{ translateX: shimmerTranslateX }] }]} />
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </View>
          )}
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 60 : 35,
    paddingBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 10,
    flex: 1,
  },
  playersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    marginBottom: 15,
    height: height * 0.18,
    paddingHorizontal: 10,
  },
  playerImage: {
    width: width * 0.35,
    height: '100%',
  },
  card: {
    borderRadius: 16,
    marginBottom: 18,
    padding: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  cardIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
    opacity: 0.7,
  },
  contestInfo: {
    alignItems: 'center',
  },
  contestName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  prizePoolLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
    textAlign: 'center',
  },
  prizePool: {
    fontSize: 28,
    color: '#FFD700',
    fontWeight: '800',
    textAlign: 'center',
  },
  balanceCard: {
    alignItems: 'center',
  },
  balanceLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  balanceText: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
  },
  paymentDetails: {
    alignItems: 'center',
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 6,
  },
  detailValue: {
    fontSize: 26,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 8,
  },
  deductionNote: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 'auto',
    paddingBottom: Platform.OS === 'ios' ? 30 : 20,
  },
  payButton: {
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#FF8C00',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  buttonGradient: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  shimmerEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    opacity: 0.5,
  },
});

export default PayWithCoinsScreen;
