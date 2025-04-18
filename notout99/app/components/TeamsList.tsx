import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { getUserTeamsForMatch } from "@/app/api/getapi/teamApi";
import { router } from "expo-router";

interface TeamsListProps {
  matchId: string;
  onTeamPress?: (teamId: string) => void;
  showCreateTeamButton?: boolean;
  onCreateTeamPress?: () => void;
}

const TeamsList = ({
  matchId,
  onTeamPress,
  showCreateTeamButton = true,
  onCreateTeamPress,
}: TeamsListProps) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState(null);

  const fetchTeams = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
        setError(null);
      }

      const response = await getUserTeamsForMatch(matchId);

      if (response.success) {
        setTeams(response.data);
      } else {
        setError("Failed to fetch teams");
      }
    } catch (err) {
      console.error("Error fetching teams:", err);
      setError("An error occurred while fetching your teams");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTeams();
  }, [matchId]);

  const onRefresh = () => {
    fetchTeams(true);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e85d04" />
        <Text style={styles.loadingText}>Loading your teams...</Text>
      </View>
    );
  }

  if (error && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={[styles.button, styles.retryButton]}
          onPress={() => fetchTeams()}
        >
          <Text style={styles.buttonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#e85d04"]}
            tintColor={"#e85d04"}
          />
        }
      >
        {teams.length === 0 && !loading && !error ? (
          <View style={styles.noTeamsContainer}>
            <Text style={styles.noTeamsText}>
              You haven't created any teams for this match yet.
            </Text>
            {showCreateTeamButton && onCreateTeamPress && (
              <TouchableOpacity
                style={[styles.button, styles.createTeamButton]}
                // onPress={onCreateTeamPress}
                onPress={() => router.replace(`/screens/contest/${matchId}`)}
              >
                <Text style={styles.buttonText}>Create a Team</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {teams.map((team) => {
              const captain = team.players.find((p) => p.is_captain);
              const viceCaptain = team.players.find((p) => p.is_vice_captain);

              return (
                <TouchableOpacity
                  key={team._id}
                  style={styles.teamCard}
                  onPress={() => onTeamPress && onTeamPress(team._id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.teamHeader}>
                    <Text style={styles.teamName}>{team.name}</Text>
                    <View style={styles.headerActions}></View>
                    {team.contest_id?.contest_name && (
                      <View style={styles.contestInfo}>
                        <Text style={styles.contestName}>
                          {team.contest_id.contest_name}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.teamFooter}>
                    <View style={styles.captainViceCaptainContainer}>
                      {captain && captain.player_id && (
                        <View style={styles.captainInfo}>
                          <View style={[styles.badge, styles.captainBadge]}>
                            <Text style={styles.badgeText}>C</Text>
                          </View>
                          <Text style={styles.captainText} numberOfLines={1}>
                            {captain.player_id.short_name ||
                              captain.player_id.name}
                          </Text>
                        </View>
                      )}
                      {viceCaptain && viceCaptain.player_id && (
                        <View style={styles.captainInfo}>
                          <View style={[styles.badge, styles.viceCaptainBadge]}>
                            <Text style={styles.badgeText}>VC</Text>
                          </View>
                          <Text style={styles.vcText} numberOfLines={1}>
                            {viceCaptain.player_id.short_name ||
                              viceCaptain.player_id.name}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={styles.pointsRankContainer}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                          {team.total_points || 0}
                        </Text>
                        <Text style={styles.statLabel}>Points</Text>
                      </View>

                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{team.rank || "-"}</Text>
                        <Text style={styles.statLabel}>Rank</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </ScrollView>
      {teams.length > 0 && showCreateTeamButton && onCreateTeamPress && (
        <TouchableOpacity
          style={[styles.button, styles.createTeamFab]}
          // onPress={onCreateTeamPress}
          onPress={() => router.replace(`/screens/contest/${matchId}`)}
          // onPress={()=>router.navigate('/'))}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Create New Team</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E9F5F9",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#E9F5F9",
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: "#555770",
  },
  errorText: {
    fontSize: 16,
    color: "#D32F2F",
    textAlign: "center",
    marginBottom: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e85d04",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 25,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#FFA000",
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 15,
    paddingBottom: 90,
  },
  noTeamsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    minHeight: 300,
  },
  noTeamsText: {
    fontSize: 17,
    color: "#666880",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 24,
  },
  createTeamButton: {
    marginTop: 10,
  },
  teamCard: {
    backgroundColor: "white",
    borderRadius: 12,
    marginBottom: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    overflow: "hidden",
  },
  teamHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    backgroundColor: "rgba(232, 93, 4, 0.05)",
  },
  teamName: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#2C3E50",
    flexShrink: 1,
    marginRight: 10,
  },
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    padding: 5,
    marginLeft: 5,
  },
  contestInfo: {
    backgroundColor: "#e85d04",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 15,
  },
  contestName: {
    fontSize: 11,
    color: "white",
    fontWeight: "600",
  },
  teamFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingTop: 12,
    paddingBottom: 15,
  },
  captainViceCaptainContainer: {
    flex: 1.5,
    marginRight: 10,
    alignSelf: "flex-start",
  },
  captainInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  badge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
  },
  badgeText: {
    color: "white",
    fontSize: 8,
    fontWeight: "bold",
  },
  captainBadge: {
    backgroundColor: "#E36414",
    borderColor: "#B85010",
  },
  viceCaptainBadge: {
    backgroundColor: "#9A031E",
    borderColor: "#700216",
  },
  captainText: {
    fontSize: 13,
    color: "#333",
    fontWeight: "600",
    flexShrink: 1,
  },
  vcText: {
    fontSize: 13,
    color: "#555",
    fontWeight: "500",
    flexShrink: 1,
  },
  pointsRankContainer: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
    alignSelf: "center",
  },
  statItem: {
    alignItems: "center",
    marginLeft: 15,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2C7A7B",
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "#666880",
  },
  createTeamFab: {
    position: "absolute",
    bottom: 20,
    right: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
});

export default TeamsList;
