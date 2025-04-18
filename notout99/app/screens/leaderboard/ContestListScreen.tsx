import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { ArrowLeft, Trophy } from "lucide-react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { fetchContest } from "@/app/api/getapi/getApi"; // Adjust import based on your API function

const ContestListScreen = () => {
  // Fetch all contests
  const {
    data: contestsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["allContests"],
    queryFn: fetchContest,
  });

  const contests = contestsResponse?.contests || [];

  // Handle loading state
  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e85d04" />
        <Text>Loading Contests...</Text>
      </View>
    );
  }

  // Handle error state
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Error fetching contests:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonError}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Navigate to the leaderboard screen for a specific contest
  const navigateToLeaderboard = (contest) => {
    router.push({
      pathname: "/screens/leaderboard/LeaderboardScreen",
      params: {
        contestId: contest._id,
        contestName: contest.contest_name,
        prizePool: `₹${contest.totalPricePool}`,
        spotsLeft: `${
          (contest.maxEntries || 0) - (contest.participants_count || 0)
        }`,
        totalSpots: `${contest.maxEntries || 0}`,
      },
    });
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#e85d04", "#fb923c"]} style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Leaderboards</Text>
        <View style={styles.placeholderRight} />
      </LinearGradient>

      <View style={styles.subheader}>
        <Text style={styles.subheaderTitle}>Select a Contest</Text>
        <Text style={styles.subheaderDesc}>
          View the leaderboard for any of your joined contests
        </Text>
      </View>

      <ScrollView style={styles.contestsContainer}>
        {contests.length === 0 ? (
          <Text style={styles.noContestsText}>No contests available</Text>
        ) : (
          contests.map((contest) => (
            <TouchableOpacity
              key={contest._id}
              style={styles.contestCard}
              onPress={() => navigateToLeaderboard(contest)}
            >
              <View style={styles.contestTypeContainer}>
                <Text style={styles.contestType}>{contest.contest_name}</Text>
                <Trophy color="#e85d04" size={20} />
              </View>

              <View style={styles.contestAmountRow}>
                <Text style={styles.amountText}>
                  ₹ {contest.totalPricePool}
                </Text>
                <View style={styles.entryBadge}>
                  <Text style={styles.badgeText}>₹{contest.entry_fee} </Text>
                </View>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${
                          (contest.participants_count / contest.maxEntries) *
                          100
                        }%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.spotsContainer}>
                  <Text style={styles.spotsText}>
                    {contest.maxEntries - contest.participants_count} Left
                  </Text>
                  <Text style={styles.spotsText}>
                    {contest.maxEntries} Spots
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>1st Prize</Text>
                  <Text style={styles.infoValue}>₹{contest.firstPrice}</Text>
                </View>
                <View style={styles.viewLeaderboardButton}>
                  <Text style={styles.viewLeaderboardText}>
                    VIEW LEADERBOARD
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 30,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  backButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
  placeholderRight: {
    width: 40,
  },
  subheader: {
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  subheaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
    marginBottom: 4,
  },
  subheaderDesc: {
    fontSize: 14,
    color: "#64748b",
  },
  contestsContainer: {
    flex: 1,
    padding: 12,
  },
  contestCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  contestTypeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  contestType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  contestAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  amountText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e293b",
  },
  entryBadge: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    color: "#475569",
    fontWeight: "600",
    fontSize: 14,
  },
  progressBarContainer: {
    marginVertical: 8,
  },
  progressBar: {
    height: 5,
    backgroundColor: "#e0e0e0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FF5252",
  },
  spotsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
  },
  spotsText: {
    fontSize: 12,
    color: "#666",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  infoItem: {
    flexDirection: "column",
  },
  infoLabel: {
    fontSize: 12,
    color: "#64748b",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  viewLeaderboardButton: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  viewLeaderboardText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#e85d04",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  backButtonError: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: "#e85d04",
    borderRadius: 20,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  noContestsText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#64748b",
  },
});

export default ContestListScreen;
