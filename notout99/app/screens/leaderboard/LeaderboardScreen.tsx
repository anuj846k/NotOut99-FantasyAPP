import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Platform,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Dimensions,
} from "react-native";
import {
  ArrowLeft,
  Trophy,
  RefreshCw,
  Crown,
  Star,
  ChevronUp,
} from "lucide-react-native";
import { router, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { fetchContestLeaderboard } from "@/app/api/getapi/teamApi";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const LeaderboardScreen = () => {
  const { contestId, contestName, prizePool, spotsLeft, totalSpots } =
    useLocalSearchParams<{
      contestId: string;
      contestName?: string;
      prizePool?: string;
      spotsLeft?: string;
      totalSpots?: string;
    }>();
  const [activeTab, setActiveTab] = useState("Leaderboard");
  const [refreshing, setRefreshing] = useState(false);
  const spinValue = new Animated.Value(0);

  // Create rotation animation for refresh icon
  useEffect(() => {
    if (refreshing) {
      Animated.loop(
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      spinValue.setValue(0);
    }
  }, [refreshing]);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const {
    data: leaderboardResponse,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["contestLeaderboard", contestId],
    queryFn: () => fetchContestLeaderboard(contestId),
    enabled: !!contestId,
  });

  const leaderboardData = leaderboardResponse?.data ?? [];

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing leaderboard:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleManualRefresh = () => {
    onRefresh();
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#e85d04" />
        <Text style={styles.loadingText}>Loading Leaderboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>
          Error fetching leaderboard:{" "}
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

  if (!contestId) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Contest ID not provided.</Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButtonError}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Get top 3 entries for podium display
  const topEntries = leaderboardData.slice(0, 3);

  // Limit leaderboard to top 20 entries
  const limitedLeaderboardData = leaderboardData.slice(0, 20);

  return (
    <View style={styles.container}>
      {/* Match HomeScreen header gradient */}
      <LinearGradient colors={["#e85d04", "#fb923c"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{contestName || "Leaderboard"}</Text>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <TouchableOpacity
              onPress={handleManualRefresh}
              style={styles.refreshButton}
              disabled={isLoading || refreshing}
            >
              <RefreshCw color="#fff" size={20} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </LinearGradient>

      {/* Animated scroll content with light theme background */}
      <ScrollView
        style={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#e85d04"]}
            tintColor="#e85d04"
          />
        }
      >
        {/* Prize card with brand colors */}
        <View style={styles.prizePoolContainer}>
          <LinearGradient
            colors={["#e85d04", "#fb923c"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
            <View style={styles.prizePoolHeader}>
              <View style={styles.prizeIconContainer}>
                <Trophy color="#ffffff" size={28} style={styles.trophyIcon} />
              </View>
              <View style={styles.prizeTextContainer}>
                <Text style={styles.prizeLabel}>PRIZE POOL</Text>
                <Text style={styles.prizeAmount}>{prizePool || "₹10,000"}</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{leaderboardData.length}</Text>
                <Text style={styles.statLabel}>PARTICIPANTS</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {leaderboardData.length > 0
                    ? leaderboardData[0].total_points.toFixed(1)
                    : "-"}
                </Text>
                <Text style={styles.statLabel}>TOP SCORE</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.statItem}>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveBlinkingDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Winners Podium for Top 3 (only show if we have entries) */}
        {topEntries.length > 0 && (
          <View style={styles.podiumContainer}>
            <Text style={styles.podiumTitle}>TOP PERFORMERS</Text>
            <View style={styles.podiumRow}>
              {/* Second Place */}
              {topEntries.length >= 2 && (
                <View style={styles.podiumItem}>
                  <View style={styles.placeCircle}>
                    <Text style={styles.placeNumber}>2</Text>
                  </View>
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
                    }}
                    style={styles.podiumAvatar}
                  />
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {topEntries[1].user_id.firstName || "User"}
                  </Text>
                  <Text style={styles.podiumPoints}>
                    {topEntries[1].total_points.toFixed(1)} pts
                  </Text>
                </View>
              )}

              {/* First Place (center, taller) */}
              {topEntries.length >= 1 && (
                <View style={styles.podiumItemFirst}>
                  <View style={styles.crownContainer}>
                    <Crown color="#FFD700" size={24} />
                  </View>
                  <View style={styles.placeCircleFirst}>
                    <Text style={styles.placeNumberFirst}>1</Text>
                  </View>
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
                    }}
                    style={styles.podiumAvatarFirst}
                  />
                  <Text style={styles.podiumNameFirst} numberOfLines={1}>
                    {topEntries[0].user_id.firstName || "User"}
                  </Text>
                  <Text style={styles.podiumPointsFirst}>
                    {topEntries[0].total_points.toFixed(1)} pts
                  </Text>
                </View>
              )}

              {/* Third Place */}
              {topEntries.length >= 3 && (
                <View style={styles.podiumItem}>
                  <View style={styles.placeCircle}>
                    <Text style={styles.placeNumber}>3</Text>
                  </View>
                  <Image
                    source={{
                      uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
                    }}
                    style={styles.podiumAvatar}
                  />
                  <Text style={styles.podiumName} numberOfLines={1}>
                    {topEntries[2].user_id.firstName || "User"}
                  </Text>
                  <Text style={styles.podiumPoints}>
                    {topEntries[2].total_points.toFixed(1)} pts
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Motivational Banner - using similar style to HomeScreen */}
        <View style={styles.motivationContainer}>
          <LinearGradient
            colors={["#e85d04", "#fb923c"]}
            style={styles.motivationGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Star color="#FFFFFF" size={18} style={{ marginRight: 8 }} />
            <Text style={styles.motivationText}>
              Predict. Win. Celebrate. Rise to the top!
            </Text>
          </LinearGradient>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              activeTab === "Leaderboard" && styles.activeTab,
            ]}
            onPress={() => setActiveTab("Leaderboard")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Leaderboard" && styles.activeTabText,
              ]}
            >
              Rankings
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "Winnings" && styles.activeTab]}
            onPress={() => setActiveTab("Winnings")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Winnings" && styles.activeTabText,
              ]}
            >
              Payouts
            </Text>
          </TouchableOpacity>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.allTeamsText}>
            Top 20 Teams ({Math.min(leaderboardData.length, 20)} of{" "}
            {leaderboardData.length})
          </Text>
          <View style={styles.rightHeader}>
            <Text style={styles.ptsText}>Pts</Text>
          </View>
        </View>

        {/* Last refreshed indicator */}
        <View style={styles.lastRefreshedContainer}>
          <Text style={styles.lastRefreshedText}>
            Pull down to refresh rankings
          </Text>
        </View>

        {/* Leaderboard Entries */}
        {leaderboardData.length === 0 && activeTab === "Leaderboard" && (
          <View style={styles.emptyStateContainer}>
            <Trophy color="#cbd5e1" size={48} />
            <Text style={styles.noEntriesText}>No leaderboard entries yet</Text>
            <Text style={styles.noEntriesSubtext}>
              Check back after the match begins
            </Text>
          </View>
        )}

        {activeTab === "Leaderboard" &&
          limitedLeaderboardData.map((entry, index) => (
            <View
              key={entry._id || index}
              style={[
                styles.userCard,
                entry.rank === 1 ? styles.firstPlace : null,
                entry.rank === 2 ? styles.secondPlace : null,
                entry.rank === 3 ? styles.thirdPlace : null,
              ]}
            >
              <View style={styles.rankBadge}>
                <Text style={styles.rankBadgeText}>{entry.rank}</Text>
              </View>

              <View style={styles.userInfo}>
                <Image
                  source={{
                    uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
                  }}
                  style={styles.avatar}
                />
                <View style={styles.userDetails}>
                  <Text style={styles.userName}>
                    {entry.user_id.firstName ||
                      entry.user_id.lastName ||
                      "Unknown User"}
                  </Text>
                  {/* <Text style={styles.teamNameText}>{entry.name}</Text> */}
                </View>
              </View>

              <View style={styles.scoreInfo}>
                <View style={styles.pointsContainer}>
                  <Text style={styles.points}>
                    {entry.total_points.toFixed(1)}
                  </Text>
                  {entry.rank <= 3 && (
                    <View
                      style={[
                        styles.topRanker,
                        entry.rank === 1
                          ? styles.goldRanker
                          : entry.rank === 2
                          ? styles.silverRanker
                          : styles.bronzeRanker,
                      ]}
                    >
                      <ChevronUp color="#fff" size={12} />
                    </View>
                  )}
                </View>
              </View>
            </View>
          ))}

        {activeTab === "Winnings" && (
          <View style={styles.payoutsContainer}>
            <View style={styles.payoutCard}>
              <View style={styles.payoutRank}>
                <Text style={styles.payoutRankText}>1st</Text>
              </View>
              <View style={styles.payoutInfo}>
                <Text style={styles.payoutAmount}>₹5,000</Text>
                <Text style={styles.payoutDesc}>Winner takes all</Text>
              </View>
            </View>

            <View style={styles.payoutCard}>
              <View style={styles.payoutRank}>
                <Text style={styles.payoutRankText}>2nd</Text>
              </View>
              <View style={styles.payoutInfo}>
                <Text style={styles.payoutAmount}>₹3,000</Text>
                <Text style={styles.payoutDesc}>Runner-up prize</Text>
              </View>
            </View>

            <View style={styles.payoutCard}>
              <View style={styles.payoutRank}>
                <Text style={styles.payoutRankText}>3rd</Text>
              </View>
              <View style={styles.payoutInfo}>
                <Text style={styles.payoutAmount}>₹1,500</Text>
                <Text style={styles.payoutDesc}>Third place prize</Text>
              </View>
            </View>

            <View style={styles.payoutCard}>
              <View style={styles.payoutRank}>
                <Text style={styles.payoutRankText}>4-10</Text>
              </View>
              <View style={styles.payoutInfo}>
                <Text style={styles.payoutAmount}>₹500</Text>
                <Text style={styles.payoutDesc}>Consolation prize</Text>
              </View>
            </View>
          </View>
        )}

        {/* Bottom padding */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc", // Light theme base color to match HomeScreen
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
  refreshButton: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContent: {
    flex: 1,
    backgroundColor: "#f8fafc", // Light theme for scrollable content
  },
  prizePoolContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gradientBackground: {
    padding: 0,
    overflow: "hidden",
  },
  prizePoolHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 20,
  },
  prizeIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  trophyIcon: {
    marginTop: 2,
  },
  prizeTextContainer: {
    flex: 1,
  },
  prizeLabel: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "500",
    letterSpacing: 1,
    opacity: 0.9,
  },
  prizeAmount: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginTop: 2,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    width: 1,
    height: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 10,
    color: "#ffffff",
    fontWeight: "500",
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveBlinkingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ffffff",
    marginRight: 6,
  },
  liveText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "600",
  },
  podiumContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  podiumTitle: {
    color: "#1e293b",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
  },
  podiumRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-end",
    height: 150,
  },
  podiumItem: {
    alignItems: "center",
    width: SCREEN_WIDTH * 0.25,
  },
  podiumItemFirst: {
    alignItems: "center",
    width: SCREEN_WIDTH * 0.3,
    marginBottom: 16,
  },
  placeCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#64748b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  placeCircleFirst: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e85d04",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  placeNumber: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  placeNumberFirst: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
  crownContainer: {
    marginBottom: 2,
  },
  podiumAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: "#64748b",
  },
  podiumAvatarFirst: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: "#e85d04",
  },
  podiumName: {
    color: "#1e293b",
    fontSize: 12,
    fontWeight: "500",
    marginTop: 6,
    maxWidth: SCREEN_WIDTH * 0.25,
    textAlign: "center",
  },
  podiumNameFirst: {
    color: "#1e293b",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 8,
    maxWidth: SCREEN_WIDTH * 0.3,
    textAlign: "center",
  },
  podiumPoints: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  podiumPointsFirst: {
    color: "#e85d04",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 2,
  },
  motivationContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  motivationGradient: {
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  motivationText: {
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
    padding: 4,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: "#fff8f3",
  },
  tabText: {
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#e85d04",
    fontWeight: "600",
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 9,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  allTeamsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
  },
  rightHeader: {
    flexDirection: "row",
    width: 120,
    justifyContent: "flex-end",
  },
  ptsText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    marginRight: 24,
  },
  rankText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1e293b",
    width: 40,
  },
  lastRefreshedContainer: {
    padding: 8,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  lastRefreshedText: {
    fontSize: 12,
    color: "#64748b",
    textAlign: "center",
  },
  emptyStateContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  noEntriesText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1e293b",
    marginTop: 16,
  },
  noEntriesSubtext: {
    fontSize: 14,
    color: "#64748b",
    marginTop: 8,
    textAlign: "center",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  firstPlace: {
    backgroundColor: "#fff8f3",
    borderLeftWidth: 3,
    borderLeftColor: "#e85d04",
  },
  secondPlace: {
    backgroundColor: "#f8fafc",
  },
  thirdPlace: {
    backgroundColor: "#fef3c7",
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  rankBadgeText: {
    color: "#475569",
    fontSize: 12,
    fontWeight: "bold",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    color: "#1e293b",
    fontSize: 14,
    fontWeight: "600",
  },
  teamNameText: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 2,
  },
  scoreInfo: {
    alignItems: "flex-end",
  },
  pointsContainer: {
    alignItems: "center",
  },
  points: {
    color: "#1e293b",
    fontSize: 16,
    fontWeight: "600",
  },
  topRanker: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  goldRanker: {
    backgroundColor: "#e85d04",
  },
  silverRanker: {
    backgroundColor: "#94a3b8",
  },
  bronzeRanker: {
    backgroundColor: "#d97706",
  },
  payoutsContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  payoutCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  payoutRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff8f3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    borderWidth: 1,
    borderColor: "#e85d04",
  },
  payoutRankText: {
    color: "#e85d04",
    fontSize: 16,
    fontWeight: "bold",
  },
  payoutInfo: {
    flex: 1,
  },
  payoutAmount: {
    color: "#1e293b",
    fontSize: 18,
    fontWeight: "600",
  },
  payoutDesc: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 4,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8fafc",
    padding: 20,
  },
  loadingText: {
    color: "#1e293b",
    fontSize: 16,
    fontWeight: "500",
    marginTop: 12,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  backButtonError: {
    backgroundColor: "#e85d04",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default LeaderboardScreen;
