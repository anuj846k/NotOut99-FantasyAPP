import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { Bell, Award } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { useQuery } from "@tanstack/react-query";
import { fetchContest, fetchMyMatches } from "@/app/api/getapi/getApi";
import { Link, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LiveScoreResponse = {
  mid: string;
  status: number;
  status_str: string;
  game_state: number;
  game_state_str: string;
  status_note: string;
  day_remaining_over: string;
  team_batting: string;
  team_bowling: string;
  live_inning_number: number;
  live_score?: {
    runs: number;
    overs: number;
    wickets: number;
    target?: number;
    runrate: number;
    required_runrate?: number;
  };
  commentary: number;
  wagon: number;
};

type MatchFilter = "ALL" | "LIVE" | "COMPLETED" | "SCHEDULED" | "CANCELLED";

const HomeScreen = () => {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [userData, setUserData] = useState<{
    firstName: string;
    lastName: string;
  } | null>(null);
  const [liveScoreData, setLiveScoreData] = useState<
    Record<string, LiveScoreResponse>
  >({});
  const [activeFilter, setActiveFilter] = useState<MatchFilter>("ALL");

  const { data, refetch } = useQuery({
    queryKey: ["myMatches"],
    queryFn: fetchMyMatches,
  });

  const { data: contests = { contest: [] } } = useQuery({
    queryKey: ["contests"],
    queryFn: fetchContest,
  });

  useEffect(() => {
    const getUserData = async () => {
      try {
        const storedUserData = await AsyncStorage.getItem("userData");
        if (storedUserData) {
          const parsedUserData = JSON.parse(storedUserData);
          setUserData(parsedUserData);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    getUserData();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, []);

  const sports = [
    { id: 1, name: "Cricket", icon: "cricket", active: true },
    { id: 2, name: "Football", icon: "soccer", active: false },
    { id: 3, name: "Basketball", icon: "basketball", active: false },
    { id: 4, name: "Hockey", icon: "hockey-sticks", active: false },
  ];

  const myMatches = data?.myMatches || [];
  const contest = contests?.contest;

  const fetchLiveScore = async (matchId: string) => {
    try {
      const response = await fetch(
        `https://rest.entitysport.com/v2/matches/${matchId}/live?token=${process.env.NEXT_PUBLIC_API_KEY}`,
      );

      const data = await response.json();

      if (data.status === "ok" && data.response) {
        setLiveScoreData((prev) => ({
          ...prev,
          [matchId]: data.response,
        }));
      } else {
        console.log("No live data available in response for match", matchId);
      }
    } catch (error) {
      console.error("Error fetching live score for match", matchId, ":", error);
    }
  };

  useEffect(() => {
    if (myMatches && myMatches.length > 0) {
      console.log("Found matches:", myMatches.length);

      myMatches.forEach((match: any) => {
        const id = match.match_id;

        if (id) {
          console.log(
            `Fetching live score for match ${id} (status: ${match.status})`
          );
          fetchLiveScore(id);
        }
      });
    }
  }, [myMatches]);

  const getFilteredMatches = useCallback(() => {
    const sortByDate = (matches: any[]) => {
      return [...matches].sort((a, b) => {
        const dateA = new Date(a.date_start_ist).getTime();
        const dateB = new Date(b.date_start_ist).getTime();
        return dateB - dateA;
      });
    };

    if (activeFilter === "ALL") {
      return sortByDate(myMatches).slice(0, 3);
    }

    const filtered = myMatches.filter((match: any) => {
      const liveData = liveScoreData[match.match_id];
      const hasLiveData = !!liveData;

      switch (activeFilter) {
        case "LIVE":
          return (
            hasLiveData &&
            liveData.status === 3 &&
            liveData.status_str !== "Completed"
          );
        case "COMPLETED":
          return hasLiveData && liveData.status_str === "Completed";
        case "SCHEDULED":
          return (
            (match.status === 1 || match.status_str === "Scheduled") ||
            (hasLiveData && (liveData.status === 1 || liveData.status_str === "Scheduled"))
          );
        case "CANCELLED":
          return hasLiveData && liveData.status_str === "Cancelled";
        default:
          return false;
      }
    });

    return sortByDate(filtered).slice(0, 3);
  }, [myMatches, liveScoreData, activeFilter]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <LinearGradient colors={["#e85d04", "#fb923c"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Image
              source={{
                uri: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
              }}
              style={styles.avatar}
            />
            <View>
              <Text style={styles.welcomeText}>
                Welcome back{userData?.firstName ? "," : ""}
              </Text>
              <Text style={styles.nameText}>
                {userData ? `${userData.firstName} ${userData.lastName}` : ""}
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() =>
                router.push("/screens/leaderboard/ContestListScreen")
              }
            >
              <Award color="white" size={24} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Bell color="white" size={24} />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Replace the search bar  */}
      </LinearGradient>

      <View style={styles.sportsContainer}>
        {sports.map((sport) => (
          <TouchableOpacity
            key={sport.id}
            style={[styles.sportItem, sport.active && styles.activeSport]}
          >
            <MaterialCommunityIcons
              name={sport.icon as any}
              size={24}
              color={sport.active ? "#e85d04" : "#64748b"}
            />
            <Text
              style={[styles.sportName, sport.active && styles.activeSportText]}
            >
              {sport.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.promoBannerContainer}>
        <LinearGradient
          colors={["#e85d04", "#fb923c"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.promoBanner}
        >
          <View style={styles.promoContent}>
            <View style={styles.promoTextContent}>
              <View style={styles.promoTagContainer}>
                <MaterialCommunityIcons name="star" size={16} color="#fff" />
                <Text style={styles.promoTag}>NEW USER OFFER</Text>
              </View>
              <Text style={styles.promoTitle}>₹500 FREE</Text>
              <Text style={styles.promoSubtitle}>Risk-free first bet</Text>
              <TouchableOpacity style={styles.claimButton}>
                <Text style={styles.claimButtonText}>
                  Claim Now{" "}
                  <MaterialCommunityIcons
                    name="arrow-right"
                    size={20}
                    color="#e85d04"
                  />
                </Text>
              </TouchableOpacity>
            </View>
            <Image
              source={require("../../../assets/images/betImg.png")}
              style={styles.promoImage}
              resizeMode="contain"
            />
          </View>
        </LinearGradient>
      </View>

      <View style={styles.matchesSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Matches</Text>
          <TouchableOpacity
            onPress={() => router.push("/screens/home/AllMatches")}
          >
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {["ALL", "LIVE", "COMPLETED"].map(
            (filter) => (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterButton,
                  activeFilter === filter && styles.activeFilterButton,
                ]}
                onPress={() => setActiveFilter(filter as MatchFilter)}
              >
                <Text
                  style={[
                    styles.filterText,
                    activeFilter === filter && styles.activeFilterText,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            )
          )}
        </ScrollView>

        {getFilteredMatches().length > 0 ? (
          getFilteredMatches().map((match: any) => {
            const matchId = match.match_id;
            const liveData = liveScoreData[matchId];
            const hasLiveData = !!liveData;
            const isCompleted =
              hasLiveData && liveData.status_str === "Completed";
            const isLive = hasLiveData && liveData.status === 2 && !isCompleted;
            const isScheduled =
              hasLiveData && liveData.status === 1 && !isCompleted;

            return (
              <Link
                href={`/screens/contest/${match._id}` as any}
                key={matchId}
                style={styles.matchCard}
              >
                <View style={styles.leagueHeaderContainer}>
                  <View style={styles.leagueInfoWrapper}>
                    <Text
                      style={styles.leagueTitle}
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {match.competition?.title || "Tournament"}
                    </Text>
                  </View>
                  {hasLiveData && (
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: isCompleted
                            ? "#f1f5f9"
                            : isLive
                            ? "#dcfce7"
                            : "#e2f5ff",
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.statusDot,
                          {
                            backgroundColor: isCompleted
                              ? "#64748b"
                              : isLive
                              ? "#22c55e"
                              : "#3b82f6",
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.statusText,
                          {
                            color: isCompleted
                              ? "#64748b"
                              : isLive
                              ? "#15803d"
                              : "#1d4ed8",
                          },
                        ]}
                      >
                        {liveData.status_str || "Scheduled"}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.matchContent}>
                  <View style={styles.teamContainer}>
                    <Image
                      source={{ uri: match.teama?.logo_url }}
                      style={styles.teamLogo}
                    />
                    <Text style={styles.teamName}>
                      {match.teama?.name || "Team A"}
                    </Text>
                  </View>

                  <View style={styles.centerContainer}>
                    {!hasLiveData ? (
                      <>
                        <Text style={styles.vsText}>VS</Text>
                        <Text style={styles.matchTime}>
                          {typeof match.date_start_ist === "string"
                            ? new Date(match.date_start_ist).toLocaleTimeString(
                                "en-US",
                                {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "TBD"}
                        </Text>
                        <Text style={styles.matchDate}>
                          {typeof match.date_start_ist === "string"
                            ? new Date(match.date_start_ist).toLocaleDateString(
                                "en-US",
                                {
                                  day: "numeric",
                                  month: "short",
                                }
                              )
                            : ""}
                        </Text>
                      </>
                    ) : (
                      <View style={styles.liveScoreWrapper}>
                        {liveData.live_score && (
                          <>
                            <Text style={styles.scoreText}>
                              {liveData.live_score.runs}/
                              {liveData.live_score.wickets}
                            </Text>
                            <Text style={styles.oversText}>
                              ({liveData.live_score.overs} ov)
                            </Text>
                            {!isCompleted && (
                              <Text style={styles.runRate}>
                                CRR: {liveData.live_score.runrate.toFixed(2)}
                              </Text>
                            )}
                          </>
                        )}
                      </View>
                    )}
                  </View>

                  <View style={styles.teamContainer}>
                    <Image
                      source={{ uri: match.teamb?.logo_url }}
                      style={styles.teamLogo}
                    />
                    <Text style={styles.teamName}>
                      {match.teamb?.name || "Team B"}
                    </Text>
                  </View>
                </View>

                {hasLiveData && liveData.status_note && (
                  <View style={styles.statusNoteContainer}>
                    <Text style={styles.statusNoteText}>
                      {liveData.status_note}
                    </Text>
                  </View>
                )}
              </Link>
            );
          })
        ) : (
          <View style={styles.noMatchesCard}>
            <MaterialCommunityIcons
              name={activeFilter === "LIVE" ? "cricket" : "tennis-ball"}
              size={40}
              color="#94a3b8"
            />
            <Text style={styles.noMatchesTitle}>
              No {activeFilter.toLowerCase()} matches
            </Text>
            <Text style={styles.noMatchesSubtext}>
              {activeFilter === "LIVE"
                ? "There are no live matches at the moment"
                : activeFilter === "SCHEDULED"
                ? "No upcoming matches scheduled"
                : activeFilter === "COMPLETED"
                ? "No completed matches yet"
                : "Check back later for more matches"}
            </Text>
            {activeFilter !== "ALL" && (
              <TouchableOpacity
                style={styles.showAllButton}
                onPress={() => setActiveFilter("ALL")}
              >
                <Text style={styles.showAllButtonText}>Show all matches</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
  },
  welcomeText: {
    color: "#fff",
    opacity: 0.9,
    fontSize: 14,
  },
  nameText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 2,
  },
  balanceText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    gap: 16,
  },
  iconButton: {
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ef4444",
    borderWidth: 1,
    borderColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#1e293b",
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 16,
    backgroundColor: "#fff",
    marginTop: -24,
    marginHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  actionButton: {
    alignItems: "center",
    gap: 8,
  },
  actionText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
  },
  sportsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    marginTop: 5,
  },
  sportItem: {
    alignItems: "center",
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    minWidth: 80,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  activeSport: {
    backgroundColor: "#fff8f3",
    borderWidth: 1,
    borderColor: "#e85d04",
  },
  sportName: {
    marginTop: 4,
    fontSize: 12,
    color: "#64748b",
    fontWeight: "500",
  },
  activeSportText: {
    color: "#e85d04",
    fontWeight: "600",
  },
  promoBannerContainer: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  promoBanner: {
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  promoContent: {
    flexDirection: "row",
    padding: 16,
    height: 200,
    alignItems: "center",
    justifyContent: "space-between",
  },
  promoTextContent: {
    flex: 1,
    justifyContent: "center",
    paddingRight: 8,
  },
  promoTagContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.15)",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  promoTag: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  promoTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#FFFFFF",
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  promoSubtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.9)",
    marginBottom: 12,
  },
  claimButton: {
    backgroundColor: "#FFD700",
    paddingVertical: 11,
    paddingHorizontal: 19,
    borderRadius: 8,
    alignSelf: "flex-start",
    alignItems: "center",
  },
  claimButtonText: {
    color: "#e85d04",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  promoImage: {
    marginTop: 60,
    marginLeft: 7,
    width: 150,
    height: "100%",
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
  },
  matchesSection: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  viewAllText: {
    color: "#e85d04",
    fontWeight: "600",
  },
  matchCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  leagueHeaderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "nowrap",
  },
  leagueInfoWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  leagueTitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
    flexShrink: 1,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    flexShrink: 0,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  matchContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  teamContainer: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  teamLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f8fafc",
  },
  teamName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1e293b",
    textAlign: "center",
  },
  centerContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    minWidth: 100,
  },
  vsText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#94a3b8",
    marginBottom: 4,
  },
  matchTime: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e85d04",
  },
  matchDate: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  liveScoreWrapper: {
    alignItems: "center",
    backgroundColor: "#fff8f3",
    padding: 12,
    borderRadius: 12,
    minWidth: 100,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
  },
  oversText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  runRate: {
    fontSize: 12,
    fontWeight: "600",
    color: "#e85d04",
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  contestCount: {
    fontSize: 13,
    fontWeight: "600",
    color: "#e85d04",
  },
  statusNoteContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
    alignItems: "center",
  },
  statusNoteText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    textAlign: "center",
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  activeFilterButton: {
    backgroundColor: "#fff8f3",
    borderColor: "#e85d04",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  activeFilterText: {
    color: "#e85d04",
  },
  noMatchesContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 8,
  },
  noMatchesText: {
    fontSize: 14,
    color: "#64748b",
    fontWeight: "500",
  },
  noMatchesCard: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    marginTop: 8,
  },
  noMatchesTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 8,
  },
  noMatchesSubtext: {
    fontSize: 14,
    color: "#64748b",
    textAlign: "center",
  },
  showAllButton: {
    backgroundColor: "#e85d04",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 16,
  },
  showAllButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});

export default HomeScreen;
