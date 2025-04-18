import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft, CreditCard, Users, History } from "lucide-react-native";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const WalletScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [balance, setBalance] = useState(100);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    const loadBalance = async () => {
      try {
        const storedBalance = await AsyncStorage.getItem("walletBalance");
        if (storedBalance !== null) {
          setBalance(Number(storedBalance));
        }
        //Loading coins balance
        const coinsStr = await AsyncStorage.getItem("userCoins");
        if (coinsStr) {
          setCoins(parseInt(coinsStr, 10));
        }
      } catch (error) {
        console.error("Failed to load balance:", error);
      }
    };

    loadBalance();
  }, []);

  useEffect(() => {
    const updateBalance = async () => {
      if (params.balanceUpdated === "true" && params.newBalance) {
        const newAmount = Number(params.newBalance) || 0;
        const updatedBalance = balance + newAmount;

        setBalance(updatedBalance);

        try {
          await AsyncStorage.setItem(
            "walletBalance",
            updatedBalance.toString()
          );
        } catch (error) {
          console.error("Failed to save balance:", error);
        }
      }
    };

    updateBalance();
  }, [params.balanceUpdated, params.newBalance]);

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}  edges={['right', 'left', 'bottom']}>

      <LinearGradient colors={["#e85d04", "#fb923c"]} style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Wallet</Text>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <View style={styles.balanceRow}>
            <View style={styles.balanceInfo}>
              <MaterialCommunityIcons name="wallet" size={28} color="#e85d04" />
              <Text style={styles.balanceText}>
                ₹{balance.toLocaleString()}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.addCashButton}
              onPress={() => router.push("/screens/wallet/AddCash")}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#fff" />
              <Text style={styles.addCashText}>Add Money</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: "#EEF2FF" }]}>
              <MaterialCommunityIcons
                name="bank-transfer"
                size={24}
                color="#e85d04"
              />
            </View>
            <Text style={styles.actionText}>Send</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: "#F0FDF4" }]}>
              <MaterialCommunityIcons
                name="cash-multiple"
                size={24}
                color="#e85d04"
              />
            </View>
            <Text style={styles.actionText}>Request</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={()=>router.push('/screens/wallet/Transactions')}>
            <View style={[styles.actionIcon, { backgroundColor: "#FEF2F2" }]}>
              <MaterialCommunityIcons
                name="history"
                size={24}
                color="#e85d04"
              />
            </View>
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => router.push("/screens/wallet/CoinsScreen")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#FEFCE8" }]}>
              <Image
                source={{
                  uri: "https://cdn-icons-png.flaticon.com/512/2933/2933116.png",
                }}
                style={styles.coinIcon}
              />
            </View>
            <Text style={styles.actionText}>My Coins</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menuContainer}>
          <Text style={styles.sectionTitle}>More Options</Text>
          <Pressable
            style={styles.menuItem}
            onPress={() => router.push("/screens/wallet/Transactions")}
          >
            <View style={styles.menuItemLeft}>
              <History size={24} color="#e85d04" />
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemTitle}>Transaction History</Text>
                <Text style={styles.menuItemSubtitle}>Last 6 months</Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#666"
            />
          </Pressable>

          <Pressable
            style={styles.menuItem}
            onPress={() => router.push("/screens/wallet/Refer")}
          >
            <View style={styles.menuItemLeft}>
              <Users size={24} color="#e85d04" />
              <View style={styles.menuItemTextContainer}>
                <Text style={styles.menuItemTitle}>Refer & Earn</Text>
                <Text style={styles.menuItemSubtitle}>
                  Invite friends & get rewards
                </Text>
              </View>
            </View>
            <MaterialCommunityIcons
              name="chevron-right"
              size={24}
              color="#666"
            />
          </Pressable>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      <TouchableOpacity style={styles.withdrawButton}>
        <MaterialCommunityIcons
          name="bank-transfer-out"
          size={24}
          color="#fff"
        />
        <Text style={styles.withdrawText}>WITHDRAW MONEY</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default WalletScreen;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  scrollContainer: {
    flex: 1,
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
  balanceCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 8,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  balanceInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  balanceText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1e293b",
  },
  addCashButton: {
    backgroundColor: "#e85d04",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  addCashText: {
    color: "#fff",
    fontWeight: "600",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    gap: 4,
    marginBottom: 16,
  },
  actionButton: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 4,
    borderRadius: 12,
    width: "22%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionText: {
    marginTop: 5,
    color: "#475569",
    fontSize: 13,
    fontWeight: "500",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1e293b",
    marginHorizontal: 16,
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    margin: 16,
    padding: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuItemTextContainer: {
    gap: 4,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
  },
  menuItemSubtitle: {
    fontSize: 13,
    color: "#64748b",
  },
  withdrawButton: {
    backgroundColor: "#e85d04",
    margin: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
  },
  withdrawText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  coinIcon: {
    width: 24,
    height: 24,
  },
});
