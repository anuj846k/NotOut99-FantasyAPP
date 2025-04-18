import { router } from "expo-router";
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ImageBackground,
} from "react-native";

interface TeamDetailProps {
  team: any;
  onClose?: () => void;
  onEditTeam?: () => void;
}

const TeamDetail = ({ team, onClose, onEditTeam }: TeamDetailProps) => {
  // Group players by role
  const playersByRole = {
    "wicket-keeper": team.players.filter(
      (p) => p.player_id.role === "wicket-keeper"
    ),
    batsman: team.players.filter((p) => p.player_id.role === "batsman"),
    "all-rounder": team.players.filter(
      (p) => p.player_id.role === "all-rounder"
    ),
    bowler: team.players.filter((p) => p.player_id.role === "bowler"),
  };

  // Helper function to render player card
  const renderPlayerCard = (player) => (
    <View key={player.player_id._id} style={styles.playerCard}>
      <View style={styles.playerImageContainer}>
        <Image
          source={require("@/assets/images/player.png")}
          style={styles.playerImage}
        />
        {player.is_captain && (
          <View style={[styles.badge, styles.captainBadge]}>
            <Text style={styles.badgeText}>C</Text>
          </View>
        )}
        {player.is_vice_captain && (
          <View style={[styles.badge, styles.viceCaptainBadge]}>
            <Text style={styles.badgeText}>VC</Text>
          </View>
        )}
      </View>

      <View style={styles.playerNameContainer}>
        <Text style={styles.playerName} numberOfLines={1}>
          {player.player_id.short_name
            ? player.player_id.short_name
            : player.player_id.name}
        </Text>
      </View>

      <View style={styles.playerPointsContainer}>
        <Text style={styles.playerPoints}>
          {player.player_id.fantasy_points || 0} pts
        </Text>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require("@/assets/images/image.png")}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>✕</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.headerPoints}>{team.total_points || 0} Pts</Text>
        </View>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerButtonText}>i</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.headerButton}>
          <Text
            style={[styles.headerButtonText, styles.ptsButton]}
            onPress={() => router.push("/components/FantasyPointsScreen")}
          >
            PTS
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.playersArea}>
          <View style={styles.roleSection}>
            <Text style={styles.roleTitle}>WICKET-KEEPERS</Text>
            <View style={styles.playersRow}>
              {playersByRole["wicket-keeper"].map(renderPlayerCard)}
            </View>
          </View>

          <View style={styles.roleSection}>
            <Text style={styles.roleTitle}>BATTERS</Text>
            <View style={styles.playersRow}>
              {playersByRole["batsman"].map(renderPlayerCard)}
            </View>
          </View>

          <View style={[styles.roleSection, styles.allRounderSection]}>
            <Text style={styles.roleTitle}>ALL-ROUNDERS</Text>
            <View style={styles.playersRow}>
              {playersByRole["all-rounder"].map(renderPlayerCard)}
            </View>
          </View>

          <View style={styles.roleSection}>
            <Text style={styles.roleTitle}>BOWLERS</Text>
            <View style={styles.playersRow}>
              {playersByRole["bowler"].map(renderPlayerCard)}
            </View>
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingTop: 60,
    paddingBottom: 10,
    paddingHorizontal: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerButton: {
    padding: 8,
  },
  headerButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  ptsButton: {
    fontSize: 12,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  teamName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  headerPoints: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  playersArea: {
    padding: 10,
    paddingBottom: 50,
  },
  roleSection: {
    marginBottom: 15,
    alignItems: "center",
  },
  roleTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "white",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 10,
    textAlign: "center",
  },
  allRounderSection: {},
  playersRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  playerCard: {
    width: 80,
    backgroundColor: "transparent",
    borderRadius: 0,
    padding: 0,
    marginHorizontal: 5,
    marginBottom: 15,
    alignItems: "center",
  },
  playerImageContainer: {
    width: 60,
    height: 60,
    alignItems: "center",
    marginBottom: 2,
    position: "relative",
  },
  playerImage: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    borderWidth: 1,
    borderColor: "white",
  },
  playerNameContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
    width: "100%",
    marginBottom: 1,
  },
  playerName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
  },
  playerPointsContainer: {
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingVertical: 1,
    paddingHorizontal: 4,
    borderRadius: 4,
    width: "80%",
  },
  playerPoints: {
    fontSize: 10,
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
  },
  badge: {
    position: "absolute",
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "white",
  },
  captainBadge: {
    top: 0,
    right: 0,
    backgroundColor: "#E36414",
  },
  viceCaptainBadge: {
    top: 0,
    left: 0,
    backgroundColor: "#9A031E",
  },
  badgeText: {
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
  },
});

export default TeamDetail;
