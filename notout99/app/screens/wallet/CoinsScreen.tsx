import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useAppSelector } from "@/app/store";
import { fetchCoinsOfUser } from "@/app/api/getapi/getApi";

const CoinsScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [coins, setCoins] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const { userData, loading, error } = useAppSelector((state) => state.user);

  useEffect(() => {
    loadCoinsData();
  }, []);

  const loadCoinsData = async () => {
    try {
      const userId = userData._id;
      if (!userId) {
        console.error("No user ID found");
      }

      const coinsData = await fetchCoinsOfUser(userId);
      if (!coinsData.error) {
        setCoins(coinsData.balance);
        // Sort transactions by date in descending order (most recent first)
        const sortedTransactions = [...coinsData.transactions].sort((a, b) => {
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });
        setTransactions(sortedTransactions);
      } else {
        console.error("Error:", coinsData.errorMessage);
      }
      console.log("userId:", userId);
    } catch (error) {
      console.error("Error loading coins data:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadCoinsData();
    }, [userData])
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Coins Balance</Text>
      </View>

      <View style={styles.balanceCard}>
        <Image
          source={{
            uri: "https://cdn-icons-png.flaticon.com/512/2933/2933116.png",
          }}
          style={styles.coinIcon}
        />
        <Text style={styles.balanceText}>{coins}</Text>
        <Text style={styles.balanceLabel}>Available Coins</Text>

        <TouchableOpacity
          style={styles.addCoinsButton}
          onPress={() => router.push("/screens/wallet/AddCash")}
        >
          <Text style={styles.addCoinsButtonText}>Add More Coins</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Transaction History</Text>

      <ScrollView style={styles.transactionList}>
        {transactions.length > 0 ? (
          transactions.map((transaction, index) => (
            <View key={index} style={styles.transactionItem}>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionTitle}>
                  {transaction.description}
                </Text>
                <Text style={styles.transactionDate}>
                  {new Date(transaction.date).toLocaleString()}
                </Text>
              </View>
              <Text
                style={[
                  styles.transactionAmount,
                  transaction.type === "credit"
                    ? styles.creditAmount
                    : styles.debitAmount,
                ]}
              >
                {transaction.type === "credit" ? "+" : "-"}
                {transaction.amount} Coins
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.noTransactions}>No transactions yet</Text>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#38A169",
    paddingTop: 50,
    paddingBottom: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  balanceCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    margin: 15,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  coinIcon: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  balanceText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#38A169",
  },
  balanceLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  addCoinsButton: {
    backgroundColor: "#38A169",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 15,
  },
  addCoinsButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    margin: 15,
    marginBottom: 10,
  },
  transactionList: {
    flex: 1,
    paddingHorizontal: 15,
  },
  transactionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  transactionDate: {
    fontSize: 12,
    color: "#888",
    marginTop: 3,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
  },
  creditAmount: {
    color: "#38A169",
  },
  debitAmount: {
    color: "#E53E3E",
  },
  noTransactions: {
    textAlign: "center",
    color: "#888",
    marginTop: 30,
  },
});

export default CoinsScreen;
