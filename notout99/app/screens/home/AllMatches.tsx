import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
} from "react-native";
import React, { useState, useCallback, useEffect } from "react";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useQuery } from "@tanstack/react-query";
import { fetchMyMatches } from "@/app/api/getapi/getApi";
import { Link, useRouter } from "expo-router";

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

const AllMatches = () => {
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const [liveScoreData, setLiveScoreData] = useState<
    Record<string, LiveScoreResponse>
  >({});
  const [activeFilter, setActiveFilter] = useState<MatchFilter>("ALL");

  const { data, refetch } = useQuery({
    queryKey: ["myMatches"],
    queryFn: fetchMyMatches,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    refetch().finally(() => setRefreshing(false));
  }, []);

  const fetchLiveScore = async (matchId: string) => {
    try {
      const response = await fetch(
        `https://rest.entitysport.com/v2/matches/${matchId}/live?token=${process.env.NEXT_PUBLIC_API_KEY}`
      );

      const data = await response.json();

      if (data.status === "ok" && data.response) {
        setLiveScoreData((prev) => ({
          ...prev,
          [matchId]: data.response,
        }));
      }
    } catch (error) {
      console.error("Error fetching live score for match", matchId, ":", error);
    }
  };

  useEffect(() => {
    if (data?.myMatches && data.myMatches.length > 0) {
      data.myMatches.forEach((match: any) => {
        const id = match.match_id;
        if (id) {
          fetchLiveScore(id);
        }
      });
    }
  }, [data?.myMatches]);

  const myMatches = data?.myMatches || [];

  const getFilteredMatches = useCallback(() => {
    if (activeFilter === "ALL") {
      return myMatches;
    }

    return myMatches.filter((match: any) => {
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
            match.status === 1 ||
            match.status_str === "Scheduled" ||
            (hasLiveData &&
              (liveData.status === 1 || liveData.status_str === "Scheduled"))
          );
        case "CANCELLED":
          return hasLiveData && liveData.status_str === "Cancelled";
        default:
          return true;
      }
    });
  }, [myMatches, liveScoreData, activeFilter]);

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#1e293b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>All Matches</Text>
      </View>

      <View style={styles.matchesContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {["ALL", "LIVE", "COMPLETED", "SCHEDULED", "CANCELLED"].map(
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

        {getFilteredMatches().map((match: any) => {
          const matchId = match.match_id;
          const liveData = liveScoreData[matchId];
          const hasLiveData = !!liveData;
          const isCompleted =
            hasLiveData && liveData.status_str === "Completed";
          const isLive = hasLiveData && liveData.status === 2 && !isCompleted;

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

              <View style={styles.matchInfo}>
                <View style={styles.teamInfo}>
                  <Image
                    source={{ uri: match.teama?.logo_url }}
                    style={styles.teamLogo}
                  />
                  <Text style={styles.teamName}>
                    {match.teama?.name || "Team A"}
                  </Text>
                </View>

                <View style={styles.matchCenter}>
                  {!hasLiveData ? (
                    <>
                      <Text style={styles.vsText}>VS</Text>
                      <Text style={styles.matchTime}>
                        {typeof match.date_start_ist === "string"
                          ? match.date_start_ist.substring(0, 16)
                          : "TBD"}
                      </Text>
                    </>
                  ) : liveData.live_score ? (
                    <View style={styles.liveScoreContainer}>
                      <Text style={styles.liveScoreText}>
                        {liveData.live_score.runs}/{liveData.live_score.wickets}
                      </Text>
                      <Text style={styles.liveOversText}>
                        ({liveData.live_score.overs} ov)
                      </Text>
                      {!isCompleted && (
                        <Text style={styles.runRateText}>
                          RR: {liveData.live_score.runrate.toFixed(2)}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text style={styles.statusText}>{liveData.status_str}</Text>
                  )}
                </View>

                <View style={styles.teamInfo}>
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
        })}
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
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1e293b",
  },
  matchesContainer: {
    padding: 14,
  },
  matchCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 11,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  leagueInfo: {
    flexDirection: "row",
    alignItems: "center",
    color: "#64748b",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
    gap: 8,
  },
  statusIndicator: {
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 12,
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
    // marginBottom:8
  },
  leagueTitle: {
    fontSize: 13,
    color: "#64748b",
    fontWeight: "500",
    flexShrink: 1,
    paddingVertical: 9,
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
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  matchInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  teamInfo: {
    alignItems: "center",
    flex: 1,
  },
  teamLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginBottom: 8,
  },
  teamName: {
    fontSize: 14,
    color: "#1e293b",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 8,
  },
  matchCenter: {
    alignItems: "center",
    paddingHorizontal: 16,
  },
  vsText: {
    color: "#94a3b8",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  matchTime: {
    color: "#64748b",
    fontSize: 12,
  },
  liveScoreContainer: {
    alignItems: "center",
    backgroundColor: "#fff8f3",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  liveScoreText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1e293b",
  },
  liveOversText: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },
  runRateText: {
    fontSize: 12,
    color: "#e85d04",
    fontWeight: "600",
    marginTop: 4,
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
});

export default AllMatches;
