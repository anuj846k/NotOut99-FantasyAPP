import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  StatusBar,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useState } from "react";

interface Transaction {
  id: string;
  mode: string;
  date: string;
  time: string;
  amount: number;
  failed?: boolean;
}

type TabType = "Withdrawls" | "Deposits" | "TDS" | "Others";

const TransactionsScreen = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("Withdrawls");

  const withdrawalTransactions: Transaction[] = [
    {
      id: "1",
      mode: "PAYTM",
      date: "26 Dec, 2024",
      time: "10:00 AM",
      amount: 100,
      failed: true,
    },
    {
      id: "2",
      mode: "NET Banking",
      date: "26 Dec, 2024",
      time: "10:00 AM",
      amount: 100,
    },
    {
      id: "3",
      mode: "NET Banking",
      date: "26 Dec, 2024",
      time: "10:00 AM",
      amount: 100,
    },
    {
      id: "4",
      mode: "NET Banking",
      date: "26 Dec, 2024",
      time: "10:00 AM",
      amount: 100,
    },
    {
      id: "5",
      mode: "NET Banking",
      date: "26 Dec, 2024",
      time: "10:00 AM",
      amount: 100,
    },
    {
      id: "6",
      mode: "NET Banking",
      date: "26 Dec, 2024",
      time: "10:00 AM",
      amount: 100,
    },
  ];

  const depositTransactions: Transaction[] = [
    {
      id: "d1",
      mode: "UPI",
      date: "24 Dec, 2024",
      time: "09:45 AM",
      amount: 500,
    },
    {
      id: "d2",
      mode: "Credit Card",
      date: "23 Dec, 2024",
      time: "02:30 PM",
      amount: 1000,
    },
    {
      id: "d3",
      mode: "UPI",
      date: "22 Dec, 2024",
      time: "11:15 AM",
      amount: 250,
    },
  ];

  const tdsTransactions: Transaction[] = [
    {
      id: "t1",
      mode: "TDS Deduction",
      date: "20 Dec, 2024",
      time: "11:00 PM",
      amount: 50,
    },
    {
      id: "t2",
      mode: "TDS Deduction",
      date: "15 Dec, 2024",
      time: "11:00 PM",
      amount: 75,
    },
  ];

  const otherTransactions: Transaction[] = [
    {
      id: "o1",
      mode: "Referral Bonus",
      date: "19 Dec, 2024",
      time: "03:20 PM",
      amount: 200,
    },
    {
      id: "o2",
      mode: "Promotion",
      date: "18 Dec, 2024",
      time: "10:30 AM",
      amount: 150,
      failed: true,
    },
    {
      id: "o3",
      mode: "Cashback",
      date: "17 Dec, 2024",
      time: "09:15 AM",
      amount: 50,
    },
  ];

  const getTransactionData = () => {
    switch (activeTab) {
      case "Withdrawls":
        return withdrawalTransactions;
      case "Deposits":
        return depositTransactions;
      case "TDS":
        return tdsTransactions;
      case "Others":
        return otherTransactions;
      default:
        return withdrawalTransactions;
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => (
    <View style={styles.transactionItem}>
      <View style={styles.transactionLeft}>
        <View
          style={[
            styles.iconContainer,
            item.failed && styles.iconContainerFailed,
          ]}
        >
          {item.mode === "PAYTM" && (
            <MaterialCommunityIcons
              name="wallet"
              size={20}
              color={item.failed ? "#dc2626" : "#e85d04"}
            />
          )}
          {item.mode === "NET Banking" && (
            <MaterialCommunityIcons
              name="bank"
              size={20}
              color={item.failed ? "#dc2626" : "#e85d04"}
            />
          )}
          {item.mode === "UPI" && (
            <MaterialCommunityIcons
              name="qrcode"
              size={20}
              color={item.failed ? "#dc2626" : "#e85d04"}
            />
          )}
          {item.mode === "Credit Card" && (
            <MaterialCommunityIcons
              name="credit-card"
              size={20}
              color={item.failed ? "#dc2626" : "#e85d04"}
            />
          )}
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.modeText}>{item.mode}</Text>
          <Text style={styles.dateTimeText}>
            {item.date} • {item.time}
          </Text>
        </View>
      </View>
      <View style={styles.amountContainer}>
        <Text style={[styles.amountText, item.failed && styles.failedAmount]}>
          ₹{item.amount.toLocaleString()}
        </Text>
        {item.failed && <Text style={styles.failedText}>Failed</Text>}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={["#e85d04", "#fb923c"]} style={styles.header}>
        <TouchableOpacity style={styles.backButton}>
          <ArrowLeft color="#fff" size={24} onPress={() => router.back()} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Transaction History</Text>
      </LinearGradient>

      <View style={styles.tabContainer}>
        {(["Withdrawls", "Deposits", "TDS", "Others"] as TabType[]).map(
          (tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabButton, activeTab === tab && styles.tabActive]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.tabActiveText,
                ]}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          )
        )}
      </View>

      <FlatList
        data={getTransactionData()}
        renderItem={renderTransaction}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.transactionsList}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="history" size={48} color="#cbd5e1" />
            <Text style={styles.emptyText}>No transactions found</Text>
          </View>
        }
      />
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
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    margin: 16,
    borderRadius: 12,
    padding: 4,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: "#fff8f3",
  },
  tabText: {
    color: "#64748b",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
  },
  tabActiveText: {
    color: "#e85d04",
    fontWeight: "600",
  },
  transactionsList: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff8f3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconContainerFailed: {
    backgroundColor: "#fef2f2",
  },
  transactionInfo: {
    flex: 1,
  },
  modeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginBottom: 4,
  },
  dateTimeText: {
    fontSize: 13,
    color: "#64748b",
  },
  amountContainer: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16a34a",
  },
  failedAmount: {
    color: "#dc2626",
  },
  failedText: {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 4,
  },
  separator: {
    height: 8,
    backgroundColor: "transparent",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: "#64748b",
    marginTop: 12,
  },
});

export default TransactionsScreen;
