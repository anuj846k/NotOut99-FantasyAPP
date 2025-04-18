/** @format */

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  FlatList,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft, Plus, Check } from "lucide-react-native";
import {
  fetchPlayersForMatch,
  createTeam,
  PlayerType,
} from "../../api/getapi/teamApi";
import * as Notifications from "expo-notifications";

type FilterType = "WK" | "BAT" | "AR" | "BOWL";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const CreateTeam = () => {
  const router = useRouter();
  const { match_id, contest_id } = useLocalSearchParams() as {
    match_id: string;
    contest_id: string;
  };

  const [players, setPlayers] = useState<PlayerType[]>([]);
  const [selectedPlayers, setSelectedPlayers] = useState<PlayerType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("WK");
  const [step, setStep] = useState(1); // 1: Select players, 2: Select captain/vice-captain
  const [remainingTime, setRemainingTime] = useState("21h 25m left");
  const [usedCredits, setUsedCredits] = useState(0);

  // Role count limits
  const roleLimits = {
    "wicket-keeper": { min: 1, max: 4, title: "WK" },
    batsman: { min: 3, max: 6, title: "BAT" },
    "all-rounder": { min: 1, max: 4, title: "AR" },
    bowler: { min: 3, max: 6, title: "BOWL" },
  };

  // Current count of each role
  const [roleCounts, setRoleCounts] = useState({
    "wicket-keeper": 0,
    batsman: 0,
    "all-rounder": 0,
    bowler: 0,
  });

  // Fetch players
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        console.log("Fetching players for match:", match_id);

        const playersData = await fetchPlayersForMatch(match_id);
        setPlayers(playersData);
      } catch (err) {
        console.error("Error fetching players:", err);
        setError("Error fetching players. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (match_id) {
      fetchPlayers();
    }
  }, [match_id, contest_id]);

  // Update credits and role counts when selected players change
  useEffect(() => {
    const totalCredits = selectedPlayers.reduce(
      (sum, player) => sum + player.credits,
      0
    );
    setUsedCredits(totalCredits);

    // Update role counts
    const counts = {
      "wicket-keeper": 0,
      batsman: 0,
      "all-rounder": 0,
      bowler: 0,
    };

    selectedPlayers.forEach((player) => {
      counts[player.role]++;
    });

    setRoleCounts(counts);
  }, [selectedPlayers]);

  const handlePlayerSelect = (player: PlayerType) => {
    // Check if already selected
    if (selectedPlayers.some((p) => p.player_id === player.player_id)) {
      setSelectedPlayers(
        selectedPlayers.filter((p) => p.player_id !== player.player_id)
      );
      return;
    }

    // Check total players limit (11)
    if (selectedPlayers.length >= 11) {
      Alert.alert("Team Full", "You can only select 11 players");
      return;
    }

    // Check role limits
    if (roleCounts[player.role] >= roleLimits[player.role].max) {
      Alert.alert(
        "Role Limit Exceeded",
        `You can only select a maximum of ${roleLimits[player.role].max} ${
          roleLimits[player.role].title
        } players`
      );
      return;
    }

    // Check credits limit (100)
    const newTotalCredits = usedCredits + player.credits;
    if (newTotalCredits > 100) {
      Alert.alert("Credit Limit Exceeded", "Total credits cannot exceed 100");
      return;
    }

    // Add player to selected list
    setSelectedPlayers([...selectedPlayers, player]);
  };

  const handleCaptainSelect = (
    playerId: number,
    role: "captain" | "vice_captain"
  ) => {
    setSelectedPlayers(
      selectedPlayers.map((player) => {
        if (role === "captain") {
          // Set this player as captain, remove captain status from others
          if (player.player_id === playerId) {
            return { ...player, is_captain: true, is_vice_captain: false };
          } else {
            return { ...player, is_captain: false };
          }
        } else {
          // Set this player as vice-captain, remove vice-captain status from others
          if (player.player_id === playerId) {
            return { ...player, is_vice_captain: true, is_captain: false };
          } else {
            return { ...player, is_vice_captain: false };
          }
        }
      })
    );
  };

  const isTeamValid = () => {
    // Check if we have 11 players
    if (selectedPlayers.length !== 11) return false;

    // Check role minimums
    if (roleCounts["wicket-keeper"] < roleLimits["wicket-keeper"].min)
      return false;
    if (roleCounts["batsman"] < roleLimits["batsman"].min) return false;
    if (roleCounts["all-rounder"] < roleLimits["all-rounder"].min) return false;
    if (roleCounts["bowler"] < roleLimits["bowler"].min) return false;

    return true;
  };

  const handleContinue = () => {
    if (!isTeamValid()) {
      Alert.alert(
        "Invalid Team",
        "Please select 11 players with at least 1 WK, 3 BAT, 1 AR, and 3 BOWL"
      );
      return;
    }

    setStep(2); // Move to captain selection
  };
  const requestNotificationPermissions = async () => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  };
  const showNotification = async (teamName: string) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Team Created Successfully! 🎉",
        body: `Your ${teamName} has been created and joined the contest`,
      },
      trigger: null, // Show immediately
    });
  };
  // In your handleCreateTeam function:
  const handleCreateTeam = async () => {
    const hasCaptain = selectedPlayers.some((p) => p.is_captain);
    const hasViceCaptain = selectedPlayers.some((p) => p.is_vice_captain);

    if (!hasCaptain || !hasViceCaptain) {
      Alert.alert(
        "Selection Required",
        "Please select both a Captain and Vice Captain"
      );
      return;
    }

    try {
      setLoading(true);

      // Correctly format players for API - ensure that is_captain and is_vice_captain are booleans
      const formattedPlayers = selectedPlayers.map((player) => ({
        player_id: player._id,
        is_captain: player.is_captain === true,
        is_vice_captain: player.is_vice_captain === true,
      }));

      // Verify we have exactly one captain and one vice captain
      const captainCount = formattedPlayers.filter((p) => p.is_captain).length;
      const viceCaptainCount = formattedPlayers.filter(
        (p) => p.is_vice_captain
      ).length;

      if (captainCount !== 1 || viceCaptainCount !== 1) {
        Alert.alert(
          "Team Error",
          "Please ensure you have exactly one captain and one vice captain"
        );
        setLoading(false);
        return;
      }
  

      await createTeam({
        contest_id,
        match_id,
        players: formattedPlayers,
      });
      const hasPermission = await requestNotificationPermissions();
      if (hasPermission) {
        await showNotification('Team');
      }

      Alert.alert("Success", "Team created successfully!");
      router.replace(`/screens/contest/${match_id}`);
    } catch (err: any) {
      console.error("Error creating team:", err);
      Alert.alert(
        "Error",
        err.response?.data?.message ||
          "Failed to create team. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const filterRoleMapping = {
    WK: "wicket-keeper",
    BAT: "batsman",
    AR: "all-rounder",
    BOWL: "bowler",
  };

  // Filter players based on the active tab
  const filteredPlayers = players.filter(
    (player) => player.role === filterRoleMapping[activeFilter]
  );

  const renderPlayerItem = (player: PlayerType) => {
    const isSelected = selectedPlayers.some(
      (p) => p.player_id === player.player_id
    );

    return (
      <TouchableOpacity
        style={[styles.playerCard, isSelected && styles.selectedPlayerCard]}
        onPress={() => handlePlayerSelect(player)}
      >
        <View style={styles.playerImageContainer}>
          <Image
            source={require("@/assets/images/player.png")}
            style={styles.playerImage}
          />
          <Text style={styles.playerTeam}>{player.team_name}</Text>
        </View>

        <View style={styles.playerInfo}>
          <Text style={styles.playerName}>{player.name}</Text>
          <Text style={styles.playerPoints}>
            Set by {player.fantasy_points}%
          </Text>
        </View>

        <View style={styles.playerStats}>
          <Text style={styles.playerPoints}>{player.credits}</Text>
          <Text style={styles.pointsLabel}>Points</Text>
        </View>

        <TouchableOpacity
          style={[styles.addButton, isSelected && styles.removeButton]}
          onPress={() => handlePlayerSelect(player)}
        >
          {isSelected ? (
            <Check size={16} color="#fff" />
          ) : (
            <Plus size={16} color="#fff" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderCaptainSelection = () => {
    return (
      <View style={styles.captainContainer}>
        <Text style={styles.captainHeader}>
          Choose your Captain and Vice Captain
        </Text>
        <View style={styles.captainInfo}>
          <View style={styles.captainPoints}>
            <Text style={styles.captainLabel}>C</Text>
            <Text style={styles.captainDesc}>Captain</Text>
          </View>
          <View style={styles.captainPoints}>
            <Text style={styles.viceLabel}>VC</Text>
            <Text style={styles.captainDesc}>Vice Captain</Text>
          </View>
        </View>

        <FlatList
          data={selectedPlayers}
          keyExtractor={(item) => item.player_id.toString()}
          renderItem={({ item }) => (
            <View style={styles.captainPlayerCard}>
              <Image
                source={require("@/assets/images/player.png")}
                style={styles.captainPlayerImage}
              />
              <View style={styles.captainPlayerInfo}>
                <Text style={styles.captainPlayerName}>{item.name}</Text>
                <Text style={styles.captainPlayerPoints}>
                  {item.fantasy_points} pts
                </Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  item.is_captain && styles.selectedRoleButton,
                ]}
                onPress={() => handleCaptainSelect(item.player_id, "captain")}
              >
                <Text style={styles.roleButtonText}>C</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  item.is_vice_captain && styles.selectedRoleButton,
                ]}
                onPress={() =>
                  handleCaptainSelect(item.player_id, "vice_captain")
                }
              >
                <Text style={styles.roleButtonText}>VC</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      </View>
    );
  };

  if (loading && players.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e85d04" />
        <Text style={styles.loadingText}>Loading players...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create Team</Text>
        <Text style={styles.headerTime}>{remainingTime}</Text>
      </View>

      {/* Team stats */}
      {/* <View style={styles.teamStats}>
        <View style={styles.teamCount}>
          <Text style={styles.countLabel}>Players</Text>
          <Text style={styles.countValue}>{selectedPlayers.length}/11</Text>
        </View>
        <View style={styles.teamCredits}>
          <Text style={styles.creditsLabel}>Credits</Text>
          <Text style={styles.creditsValue}>{usedCredits}/100</Text>
        </View>
      </View> */}

      <View style={styles.requirementContainer}>
        <Text style={styles.requirementTitle}>Team Requirements</Text>
        <View style={styles.requirementRow}>
          <View style={styles.requirementItem}>
            <View
              style={[styles.roleIndicator, { backgroundColor: "#3498db" }]}
            >
              <Text style={styles.roleIndicatorText}>WK</Text>
            </View>
            <Text style={styles.requirementCount}>
              {roleCounts["wicket-keeper"]}/{roleLimits["wicket-keeper"].max}
            </Text>
            <Text style={styles.requirementMinMax}>
              Min: {roleLimits["wicket-keeper"].min}
            </Text>
          </View>

          <View style={styles.requirementItem}>
            <View
              style={[styles.roleIndicator, { backgroundColor: "#e74c3c" }]}
            >
              <Text style={styles.roleIndicatorText}>BAT</Text>
            </View>
            <Text style={styles.requirementCount}>
              {roleCounts["batsman"]}/{roleLimits["batsman"].max}
            </Text>
            <Text style={styles.requirementMinMax}>
              Min: {roleLimits["batsman"].min}
            </Text>
          </View>

          <View style={styles.requirementItem}>
            <View
              style={[styles.roleIndicator, { backgroundColor: "#2ecc71" }]}
            >
              <Text style={styles.roleIndicatorText}>AR</Text>
            </View>
            <Text style={styles.requirementCount}>
              {roleCounts["all-rounder"]}/{roleLimits["all-rounder"].max}
            </Text>
            <Text style={styles.requirementMinMax}>
              Min: {roleLimits["all-rounder"].min}
            </Text>
          </View>

          <View style={styles.requirementItem}>
            <View
              style={[styles.roleIndicator, { backgroundColor: "#9b59b6" }]}
            >
              <Text style={styles.roleIndicatorText}>BWL</Text>
            </View>
            <Text style={styles.requirementCount}>
              {roleCounts["bowler"]}/{roleLimits["bowler"].max}
            </Text>
            <Text style={styles.requirementMinMax}>
              Min: {roleLimits["bowler"].min}
            </Text>
          </View>
        </View>

        <View style={styles.creditInfo}>
          <View style={styles.creditItem}>
            <Text style={styles.creditLabel}>PLAYERS</Text>
            <Text
              style={[
                styles.creditValue,
                selectedPlayers.length === 11
                  ? styles.creditComplete
                  : selectedPlayers.length > 11
                  ? styles.creditExceed
                  : null,
              ]}
            >
              {selectedPlayers.length}/11
            </Text>
          </View>

          <View style={styles.creditDivider} />

          <View style={styles.creditItem}>
            <Text style={styles.creditLabel}>CREDITS</Text>
            <Text
              style={[
                styles.creditValue,
                usedCredits > 95
                  ? usedCredits > 100
                    ? styles.creditExceed
                    : styles.creditWarning
                  : null,
              ]}
            >
              {usedCredits}/100
            </Text>
          </View>
        </View>
      </View>

      {step === 1 ? (
        <>
          {/* Role filters */}
          <View style={styles.roleFilters}>
            {Object.entries(roleLimits).map(([role, { title, min, max }]) => (
              <TouchableOpacity
                key={role}
                style={[
                  styles.roleFilter,
                  activeFilter === title && styles.activeRoleFilter,
                ]}
                onPress={() => setActiveFilter(title as FilterType)}
              >
                <Text
                  style={[
                    styles.roleFilterText,
                    activeFilter === title && styles.activeRoleFilterText,
                  ]}
                >
                  {title}
                </Text>
                <Text style={styles.roleCount}>
                  {roleCounts[role as keyof typeof roleCounts]}/{max}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Players list */}
          <FlatList
            data={filteredPlayers}
            keyExtractor={(item) => item.player_id.toString()}
            renderItem={({ item }) => renderPlayerItem(item)}
            contentContainerStyle={styles.playersList}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No players found in this category
                </Text>
              </View>
            }
          />

          {/* Continue button */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              !isTeamValid() && styles.disabledButton,
            ]}
            onPress={handleContinue}
            disabled={!isTeamValid()}
          >
            <Text style={styles.continueButtonText}>NEXT</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          {renderCaptainSelection()}

          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleCreateTeam}
          >
            <Text style={styles.saveButtonText}>SAVE</Text>
          </TouchableOpacity>
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#e85d04",
    padding: 16,
    paddingTop: Platform.OS === "ios" ? 28 : 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  headerTime: {
    fontSize: 14,
    color: "#fff",
  },
  backButton: {
    padding: 8,
  },
  requirementContainer: {
    backgroundColor: "#fff",
    padding: 12,
    marginHorizontal: 10,
    marginVertical: 8,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  requirementTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",
  },
  requirementRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },
  requirementItem: {
    alignItems: "center",
  },
  roleIndicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  roleIndicatorText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
  },
  requirementCount: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  requirementMinMax: {
    fontSize: 12,
    color: "#777",
  },
  creditInfo: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
    justifyContent: "space-around",
  },
  creditItem: {
    alignItems: "center",
  },
  creditDivider: {
    width: 1,
    backgroundColor: "#eee",
  },
  creditLabel: {
    fontSize: 12,
    color: "#777",
  },
  creditValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  creditWarning: {
    color: "#f39c12",
  },
  creditExceed: {
    color: "#e74c3c",
  },
  creditComplete: {
    color: "#2ecc71",
  },
  roleFilters: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginVertical: 8,
    borderRadius: 4,
    elevation: 1,
    marginHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  roleFilter: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeRoleFilter: {
    borderBottomColor: "#e85d04",
  },
  roleFilterText: {
    fontWeight: "500",
    color: "#777",
  },
  activeRoleFilterText: {
    color: "#e85d04",
    fontWeight: "bold",
  },
  roleCount: {
    fontSize: 12,
    color: "#999",
    marginTop: 2,
  },
  playersList: {
    paddingHorizontal: 10,
    paddingBottom: 80,
  },
  playerCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: "center",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  selectedPlayerCard: {
    backgroundColor: "rgba(232, 93, 4, 0.05)",
    borderWidth: 1,
    borderColor: "#e85d04",
  },
  playerImageContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    position: "relative",
  },
  playerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  playerTeam: {
    position: "absolute",
    bottom: -5,
    color: "#fff",
    fontSize: 10,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  playerPoints: {
    fontSize: 12,
    color: "#777",
  },
  playerStats: {
    alignItems: "center",
    marginHorizontal: 10,
  },
  pointsLabel: {
    fontSize: 10,
    color: "#999",
  },
  addButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e85d04",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButton: {
    backgroundColor: "#f48c06",
  },
  continueButton: {
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: "#e85d04",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  continueButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    color: "#777",
  },
  emptyState: {
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#777",
  },
  teamStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  teamCount: {
    alignItems: "center",
  },
  countLabel: {
    fontSize: 12,
    color: "#666",
  },
  countValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  teamCredits: {
    alignItems: "center",
  },
  creditsLabel: {
    fontSize: 12,
    color: "#666",
  },
  creditsValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  captainContainer: {
    flex: 1,
    padding: 15,
  },
  captainHeader: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
    textAlign: "center",
  },
  captainInfo: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  captainPoints: {
    alignItems: "center",
    flexDirection: "row",
  },
  captainLabel: {
    width: 24,
    height: 24,
    paddingTop: 3,

    borderRadius: 12,
    backgroundColor: "#e85d04",
    textAlign: "center",
    textAlignVertical: "center",
    color: "#fff",
    fontWeight: "bold",
    marginRight: 8,
  },
  viceLabel: {
    width: 25,
    paddingTop: 5,
    height: 25,
    borderRadius: 12,
    backgroundColor: "#f48c06",
    textAlign: "center",
    textAlignVertical: "center",
    color: "#fff",
    fontWeight: "bold",
    marginRight: 8,
  },
  captainDesc: {
    fontSize: 14,
    color: "#666",
  },
  captainPlayerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  captainPlayerImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  captainPlayerInfo: {
    flex: 1,
  },
  captainPlayerName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  captainPlayerPoints: {
    fontSize: 12,
    color: "#777",
  },
  roleButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
  selectedRoleButton: {
    backgroundColor: "#e85d04",
  },
  roleButtonText: {
    fontWeight: "bold",
    color: "#333",
  },
  saveButton: {
    backgroundColor: "#e85d04",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default CreateTeam;
