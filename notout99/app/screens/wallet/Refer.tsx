import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Share,
  Platform,
  Clipboard,
  StatusBar,
  Animated,
  Linking,
  Alert,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft, Users, Copy, Gift, Star } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const ReferScreen = () => {
  const router = useRouter();
  const referralCode = "MIR20220320";
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const fadeAnim = new Animated.Value(0);
  const bounceAnim = new Animated.Value(1);

  useEffect(() => {
    // Bounce animation for the reward amount
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    // Fade in/out animation for snackbar
    if (showSnackbar) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      const timer = setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => setShowSnackbar(false));
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [showSnackbar]);

  const copyToClipboard = () => {
    Clipboard.setString(referralCode);
    setSnackbarMessage("Referral code copied!");
    setShowSnackbar(true);
  };

  const shareReferralCode = async () => {
    try {
      await Share.share({
        message: `🎮 Join me on FlyingGames! Use my referral code ${referralCode} and get ₹200 bonus! Your friends can play UNLIMITED games for just ₹1 until they win! Download now: [App Link]`,
        title: "Join FlyingGames - Get ₹200 Bonus!",
      });
    } catch (error) {
      console.error("Error sharing:", error);
      setSnackbarMessage("Failed to open share options.");
      setShowSnackbar(true);
    }
  };

  const shareViaWhatsApp = async () => {
    const message = `🎮 Join me on FlyingGames! Use my referral code ${referralCode} and get ₹200 bonus! Your friends can play UNLIMITED games for just ₹1 until they win! Download now: [App Link]`;
    const whatsappUrl = Platform.select({
      ios: `whatsapp://send?text=${encodeURIComponent(message)}`,
      android: `whatsapp://send?text=${encodeURIComponent(message)}`,
      default: `https://wa.me/?text=${encodeURIComponent(message)}`
    });

    try {
      const canOpen = await Linking.canOpenURL(whatsappUrl);
      if (canOpen) {
        await Linking.openURL(whatsappUrl);
      } else {
        Alert.alert(
          "WhatsApp Not Found",
          "Please install WhatsApp to share via WhatsApp, or use other sharing options.",
          [ { text: "Use Other Options", onPress: shareReferralCode }, { text: "Cancel", style: "cancel" } ]
        );
      }
    } catch (error) {
      console.error('Error opening WhatsApp:', error);
      setSnackbarMessage("Failed to open WhatsApp.");
      setShowSnackbar(true);
      shareReferralCode(); // Fallback
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['right', 'left', 'bottom']}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={["#e85d04", "#fb923c"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>REFER AND WIN</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        {/* Main Reward Card */}
        <View style={[styles.card, styles.rewardCard]}>
           <View style={styles.rewardContent}>
            <Text style={styles.forEveryFriend}>For every friend you refer</Text>
            <View style={styles.rewardRow}>
              <Text style={styles.rewardStrike}>₹111</Text>
              <Animated.Text
                style={[
                  styles.rewardAmount,
                  { transform: [{ scale: bounceAnim }] },
                ]}
              >
                ₹200
              </Animated.Text>
            </View>
            <View style={styles.guaranteedTag}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#16a34a" />
              <Text style={styles.guaranteedText}>Guaranteed Bonus</Text>
            </View>
           </View>
           <Image
             source={require("../../../assets/images/player2.png")}
             style={styles.playerImageRight}
           />
        </View>

        {/* Referral Code Card */}
        <View style={[styles.card, styles.referralCodeCard]}>
            <Text style={styles.referralCodeLabel}>Your Referral Code</Text>
            <View style={styles.referralCodeRow}>
                <Text style={styles.referralCodeText}>{referralCode}</Text>
                <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                    <Copy size={18} color="#e85d04" />
                    <Text style={styles.copyButtonText}>Copy</Text>
                </TouchableOpacity>
            </View>
        </View>

        {/* Unlimited Play Card */}
        <View style={[styles.card, styles.unlimitedCard]}>
           <Image
              source={require("../../../assets/images/player-3.png")}
              style={styles.playerImageLeft}
           />
           <View style={styles.unlimitedContent}>
            <Text style={styles.unlimitedPrice}>Friend's Perk: Just ₹1 Entry!</Text>
            <Text style={styles.unlimitedText}>
              They play UNLIMITED games until their first win!
            </Text>
           </View>
        </View>

        {/* How it Works Section */}
        <View style={styles.howItWorksSection}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.step}>
                <Star size={18} color="#e85d04" style={styles.stepIcon} />
                <Text style={styles.stepText}>Share your code with friends.</Text>
            </View>
            <View style={styles.step}>
                <Users size={18} color="#e85d04" style={styles.stepIcon} />
                <Text style={styles.stepText}>Your friend signs up using your code.</Text>
            </View>
             <View style={styles.step}>
                <Gift size={18} color="#e85d04" style={styles.stepIcon} />
                <Text style={styles.stepText}>You both get awesome rewards!</Text>
            </View>
        </View>

        {/* Your Rewards Section */}
        <View style={[styles.card, styles.yourRewardsCard]}>
            <Text style={styles.sectionTitle}>Your Referral Rewards</Text>
            <View style={styles.rewardsRow}>
              <View style={styles.rewardItem}>
                <Image
                  source={require("../../../assets/images/coin.png")}
                  style={styles.rewardIcon}
                />
                <Text style={styles.rewardValue}>250</Text>
                <Text style={styles.rewardLabel}>Fantasy Coins</Text>
                <Text style={styles.rewardCondition}>When friend plays 1st Mega Contest</Text>
              </View>
              <View style={styles.rewardDivider} />
              <View style={styles.rewardItem}>
                <MaterialCommunityIcons name="wallet-giftcard" size={40} color="#e85d04" style={styles.rewardIcon} />
                <Text style={styles.rewardValue}>₹200</Text>
                <Text style={styles.rewardLabel}>Play Winnings</Text>
                <Text style={styles.rewardCondition}>When friend plays 1st Contest</Text>
              </View>
            </View>
        </View>

      </ScrollView>

      {/* Bottom Buttons - Outside ScrollView for sticky effect */}
      <View style={styles.bottomButtonsContainer}>
        <TouchableOpacity
          style={[styles.shareButton, styles.whatsappButton]}
          onPress={shareViaWhatsApp}
        >
          <MaterialCommunityIcons name="whatsapp" size={24} color="#fff" />
          <Text style={styles.shareText}>INVITE NOW</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.shareButton, styles.otherShareButton]}
          onPress={shareReferralCode}
        >
          <MaterialCommunityIcons name="share-variant" size={24} color="#e85d04"/>
        </TouchableOpacity>
      </View>

      {/* Snackbar */}
      {showSnackbar && (
        <Animated.View style={[styles.snackbar, { opacity: fadeAnim }]}>
          <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
          <Text style={styles.snackbarText}>{snackbarMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f7f7f7",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
    marginRight: 40,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    borderWidth: 1,
    borderColor: '#eee',
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#fff',
    position: 'relative',
    paddingVertical: 20,
  },
  rewardContent: {
     flex: 1,
     paddingRight: 90,
  },
  forEveryFriend: {
    color: "#555",
    fontSize: 14,
    marginBottom: 4,
    fontWeight: '500',
  },
  rewardRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
    marginTop: 4,
  },
  rewardStrike: {
    fontSize: 18,
    color: "#aaa",
    textDecorationLine: "line-through",
  },
  rewardAmount: {
    fontSize: 40,
    fontWeight: "700",
    color: "#e85d04",
  },
  guaranteedTag: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  guaranteedText: {
    color: "#16a34a",
    fontSize: 13,
    fontWeight: "600",
  },
  playerImageRight: {
     position: "absolute",
     right: -9,
     top: 0,
     width: 110,
     height: 140,
     resizeMode: "contain",
   },
  referralCodeCard: {
    backgroundColor: '#fff5e6',
    borderColor: '#ffe8cc',
  },
  referralCodeLabel: {
      fontSize: 14,
      color: '#777',
      marginBottom: 8,
      fontWeight: '500',
  },
  referralCodeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#fff',
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
  },
  referralCodeText: {
      fontSize: 18,
      fontWeight: '700',
      color: '#333',
      letterSpacing: 1,
  },
  copyButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#ffe8cc',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      gap: 5,
  },
  copyButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#e85d04',
  },
  unlimitedCard: {
     flexDirection: "row",
     alignItems: "center",
     gap: 12,
     overflow: 'hidden',
     position: 'relative',
     paddingLeft: 80,
     paddingVertical: 20,
  },
  playerImageLeft: {
     position: 'absolute',
     left: -10,
     top: -5,
     width: 90,
     height: 110,
     resizeMode: "contain",
  },
  unlimitedContent: {
     flex: 1,
  },
  unlimitedPrice: {
    color: "#e85d04",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  unlimitedText: {
    color: "#444",
    fontSize: 14,
    lineHeight: 20,
  },
  howItWorksSection: {
      backgroundColor: '#fff',
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#eee',
  },
  sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: '#333',
      marginBottom: 12,
      textAlign: 'center',
  },
  step: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 8,
      paddingLeft: 8,
  },
  stepIcon: {
      marginRight: 10,
  },
  stepText: {
      fontSize: 14,
      color: '#555',
      flex: 1,
      lineHeight: 20,
  },
  yourRewardsCard: {
      // Uses default card style
  },
  rewardsRow: {
    flexDirection: "row",
    paddingTop: 10,
  },
  rewardItem: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  rewardIcon: {
      width: 40,
      height: 40,
      marginBottom: 8,
      resizeMode: 'contain',
    },
  rewardValue: {
    fontSize: 22,
    fontWeight: "700",
    color: "#e85d04",
    marginBottom: 4,
  },
  rewardLabel: {
    fontSize: 13,
    color: "#555",
    marginBottom: 6,
    fontWeight: "600",
    textAlign: 'center',
  },
  rewardCondition: {
    fontSize: 11,
    color: "#888",
    textAlign: "center",
    lineHeight: 14,
  },
  rewardDivider: {
    width: 1,
    backgroundColor: "#eee",
    marginHorizontal: 8,
    alignSelf: 'stretch',
  },
  bottomButtonsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  shareButton: {
    borderRadius: 20,
    paddingVertical: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  whatsappButton: {
    flex: 1,
    backgroundColor: "#25D366",
  },
  otherShareButton: {
     backgroundColor: "#fff",
     paddingHorizontal: 14,
     borderColor: '#e85d04',
     borderWidth: 1.5,
   },
  shareText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  snackbar: {
    position: "absolute",
    bottom: 90,
    left: 16,
    right: 16,
    backgroundColor: "#333",
    padding: 14,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    elevation: 5,
  },
  snackbarText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
});

export default ReferScreen;
