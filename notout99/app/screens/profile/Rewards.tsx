import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const RewardsScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.rewardsHeader}>
        <Image
          source={{ uri: "https://via.placeholder.com/40" }}
          style={styles.profilePic}
        />
        <Text style={styles.rewardsHeaderTitle}>Rewards</Text>
      </View>
      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>99 Coins Balance</Text>
        <View style={styles.coinDisplay}>
          <Icon name="attach-money" size={24} color="#FFD700" />
          <Text style={styles.balanceAmount}>0</Text>
        </View>
      </View>
      <View style={styles.rewardsTabContainer}>
        <TouchableOpacity style={styles.rewardTabButton}>
          <Text style={styles.rewardTabButtonText}>Reward Shop</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.rewardTabButton, styles.activeRewardTab]}
        >
          <Text style={styles.activeRewardTabText}>My Rewards</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.rewardCardsContainer}>
        <View style={styles.rewardCardRow}>
          <View style={styles.rewardCard} />
          <View style={styles.rewardCard} />
        </View>
        <View style={styles.rewardCardRow}>
          <View style={styles.rewardCard} />
          <View style={styles.rewardCard} />
        </View>
      </View>
      <TouchableOpacity style={styles.redeemButton}>
        <Text style={styles.redeemButtonText}>REDEEM</Text>
      </TouchableOpacity>
      <View style={styles.homeIndicator} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E86C1",
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "bold",
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#2E86C1",
  },
  tabText: {
    fontSize: 14,
    color: "#777777",
  },
  activeTabText: {
    color: "#2E86C1",
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  pointsCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#E8F6FF",
    marginHorizontal: 0,
    marginVertical: 8,
    borderRadius: 4,
  },
  pointsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  pointsIconContainer: {
    marginRight: 10,
  },
  pointsTitle: {
    fontWeight: "bold",
    color: "#333333",
    fontSize: 16,
  },
  chevron: {
    marginLeft: "auto",
  },
  homeIndicator: {
    width: 100,
    height: 5,
    backgroundColor: "#CCCCCC",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 8,
    marginTop: 5,
  },
  rewardsHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  rewardsHeaderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  balanceContainer: {
    alignItems: "center",
    marginVertical: 10,
  },
  balanceText: {
    fontSize: 16,
    color: "#555555",
    paddingHorizontal: 15,
    marginBottom: 5,
  },
  coinDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
  },
  rewardsTabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    marginTop: 15,
    marginBottom: 20,
  },
  rewardTabButton: {
    backgroundColor: "white",
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 25,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#DDDDDD",
  },
  activeRewardTab: {
    backgroundColor: "#2E86C1",
    borderWidth: 0,
  },
  rewardTabButtonText: {
    color: "#333333",
    fontWeight: "500",
  },
  activeRewardTabText: {
    color: "white",
    fontWeight: "bold",
  },
  rewardCardsContainer: {
    flex: 1,
    padding: 15,
    backgroundColor: "#F5F5F5",
  },
  rewardCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  rewardCard: {
    backgroundColor: "white",
    borderRadius: 10,
    width: "48%",
    aspectRatio: 1,
  },
  redeemButton: {
    backgroundColor: "#2E86C1",
    marginHorizontal: 15,
    marginBottom: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: "center",
  },
  redeemButtonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default RewardsScreen;
