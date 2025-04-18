import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import { useAppSelector } from "@/app/store";
import { postUserCoin } from "@/app/api/postapi/postApi";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type AmountKey = 100 | 500 | 1000;

const AddCashScreen = () => {
  const router = useRouter();
  const { userData } = useAppSelector((state) => state.user);
  const amounts: AmountKey[] = [100, 500, 1000];
  const [selectedAmount, setSelectedAmount] = useState<AmountKey>(100);
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    try {
      const userId = userData?._id;
      if (!userId) {
        Alert.alert("Error", "User not found. Please login again");
        return;
      }

      setIsLoading(true);
      const response = await postUserCoin(userId, selectedAmount);
      if (response && !response.error) {
        Alert.alert(
          "Success",
          `Added ${selectedAmount * 2} coins successfully!`,
          [
            {
              text: "Close",
              onPress: () => router.back(),
              style: "cancel",
            },
            {
              text: "View Coins",
              onPress: () => router.replace("/screens/wallet/CoinsScreen"),
            },
            {
              text: "Buy More",
              onPress: () => {
                setIsLoading(false);
                setSelectedAmount(100);
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", "Failed to add coins. Please try again.");
      }
    } catch (error) {
      console.error("Error processing coin purchase:", error);
      Alert.alert("Error", "Failed to process purchase. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#e85d04", "#fb923c"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Coins</Text>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Coin Info Banner */}
        <View style={styles.coinsBanner}>
          <Image
            source={{
              uri: "https://cdn-icons-png.flaticon.com/512/2933/2933116.png",
            }}
            style={{ width: 30, height: 30 }}
          />
          <View style={styles.coinsBannerText}>
            <Text style={styles.coinsBannerTitle}>Get More Coins</Text>
            <Text style={styles.coinsBannerSubtitle}>₹1 = 2 coins</Text>
          </View>
        </View>

        <View style={styles.amountSection}>
          <Text style={styles.sectionTitle}>Select Amount</Text>
          <View style={styles.amountButtons}>
            {amounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountButton,
                  amount === selectedAmount && styles.selectedAmount,
                ]}
                onPress={() => setSelectedAmount(amount)}
              >
                <Text
                  style={[
                    styles.amountText,
                    amount === selectedAmount && styles.selectedAmountText,
                  ]}
                >
                  ₹{amount}
                </Text>
                <Text
                  style={[
                    styles.coinsText,
                    amount === selectedAmount && styles.selectedCoinsText,
                  ]}
                >
                  {amount * 2} coins
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>Benefits</Text>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color="#22c55e"
            />
            <Text style={styles.benefitText}>
              Use coins for in-game purchases
            </Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color="#22c55e"
            />
            <Text style={styles.benefitText}>Get exclusive game items</Text>
          </View>
          <View style={styles.benefitItem}>
            <MaterialCommunityIcons
              name="check-circle"
              size={24}
              color="#22c55e"
            />
            <Text style={styles.benefitText}>Unlock special features</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>You'll receive</Text>
          <Text style={styles.summaryAmount}>{selectedAmount * 2} coins</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutButton, isLoading && styles.disabledButton]}
          onPress={handleCheckout}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.checkoutButtonText}>
                Pay ₹{selectedAmount}
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="#fff"
              />
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: 60,
    zIndex: 1,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  coinsBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  coinsBannerText: {
    marginLeft: 12,
  },
  coinsBannerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  coinsBannerSubtitle: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 4,
  },
  amountSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  amountButtons: {
    gap: 12,
  },
  amountButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "transparent",
    marginBottom: 8,
  },
  selectedAmount: {
    backgroundColor: "#fff8f3",
    borderColor: "#e85d04",
  },
  amountText: {
    fontSize: 20,
    color: "#64748b",
    fontWeight: "700",
    marginBottom: 4,
  },
  selectedAmountText: {
    color: "#e85d04",
  },
  coinsText: {
    fontSize: 14,
    color: "#94a3b8",
  },
  selectedCoinsText: {
    color: "#fb923c",
  },
  benefitsSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  benefitText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#475569",
  },
  footer: {
    backgroundColor: "#fff",
    padding: 16,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  summaryText: {
    fontSize: 16,
    color: "#64748b",
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: "700",
    color: "#e85d04",
  },
  checkoutButton: {
    backgroundColor: "#e85d04",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  disabledButton: {
    backgroundColor: "#94a3b8",
  },
  checkoutButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});

export default AddCashScreen;
