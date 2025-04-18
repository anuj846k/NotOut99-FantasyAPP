import React, { useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
  Animated,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FullScorecard from "./FullScorecard";

interface BatsmanStats {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strike_rate: number;
  dismissal_text: string;
  player_id: string;
}

interface InningsData {
  score: string;
  wickets: number;
  overs: string;
  batting: BatsmanStats[];
}

interface BatsmanType {
  name: string;
  batsman_id: string;
  runs: string;
  balls_faced: string;
  fours: string;
  sixes: string;
  strike_rate: string;
}

interface BowlerType {
  name: string;
  bowler_id: string;
  overs: string;
  runs_conceded: string;
  wickets: string;
  maidens: string;
  econ: string;
}

const TeamCircle = ({ name, isActive }) => {
  const initials = name
    ? name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "T";

  return (
    <View style={[styles.teamCircle, isActive && styles.activeTeamCircle]}>
      <Text
        style={[styles.teamCircleText, isActive && styles.activeTeamCircleText]}
      >
        {initials}
      </Text>
    </View>
  );
};

const LiveScorecard = ({ matchId }) => {
  const [scoreData, setScoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scoreOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    const fetchLiveScore = async () => {
      try {
        Animated.sequence([
          Animated.timing(scoreOpacity, {
            toValue: 0.7,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scoreOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();

        const response = await fetch(
          `https://rest.entitysport.com/v2/matches/${matchId}/live?token=${process.env.NEXT_PUBLIC_API_KEY}`
        );
        const data = await response.json();
        setScoreData(data.response);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching live score:", error);
        setLoading(false);
      }
    };

    fetchLiveScore();
    const interval = setInterval(fetchLiveScore, 10000);
    return () => clearInterval(interval);
  }, [matchId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E4A11B" />
        <Text style={styles.loadingText}>Loading live score...</Text>
      </View>
    );
  }

  if (scoreData?.status === 2 || scoreData?.status_str === "Completed") {
    return <FullScorecard matchId={matchId} />;
  }

  const teamBatting = scoreData?.team_batting || "Team A";
  const teamBowling = scoreData?.team_bowling || "Team B";
  const runs = scoreData?.live_score?.runs || "0";
  const wickets = scoreData?.live_score?.wickets || "0";
  const overs = scoreData?.live_score?.overs || "0.0";
  const inningNumber = scoreData?.live_inning_number || 1;
  const isLive = scoreData?.status_str || "Live";
  const statusNote = scoreData?.status_note || "Match in progress";

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.statsContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: scoreOpacity,
            transform: [
              {
                scale: scoreOpacity.interpolate({
                  inputRange: [0.7, 1],
                  outputRange: [0.98, 1],
                }),
              },
            ],
          }}
        >
          <LinearGradient
            colors={["#FFFFFF", "#F8F8F8"]}
            style={styles.scoreCardGradient}
          >
            {/* Match Status Indicator */}
            <View style={styles.matchStatusIndicator}>
              <View style={styles.statusDot} />
              <Text style={styles.matchStatusText}>{isLive}</Text>
            </View>

            <View style={styles.teamsContainer}>
              <View style={styles.teamSection}>
                <TeamCircle name={teamBatting} isActive={true} />
                <Text style={styles.teamName} numberOfLines={1}>
                  {teamBatting}
                </Text>
                <View style={styles.scoreContainer}>
                  <Text style={styles.scoreText}>
                    {runs}/{wickets}
                  </Text>
                  <Text style={styles.oversText}>({overs} Ov)</Text>
                </View>
              </View>

              <View style={styles.vsContainer}>
                <View style={styles.vsCircle}>
                  <Text style={styles.vsText}>VS</Text>
                </View>
              </View>

              <View style={styles.teamSection}>
                <TeamCircle name={teamBowling} isActive={false} />
                <Text style={styles.teamName} numberOfLines={1}>
                  {teamBowling}
                </Text>
              </View>
            </View>

            <View style={styles.infoBar}>
              <LinearGradient
                colors={["rgba(232, 93, 4, 0.2)", "rgba(232, 93, 4, 0)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.statusGradient}
              >
                <Text style={styles.infoText}>{statusNote}</Text>
              </LinearGradient>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Batting Stats Card */}
        <View style={styles.statsCard}>
          <LinearGradient
            colors={["#FFFFFF", "#F8F8F8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statsHeader}
          >
            <View style={styles.statsTitleContainer}>
              <View style={styles.titleIconContainer}>
                <View style={styles.titleIcon} />
              </View>
              <Text style={styles.statsTitle}>BATTING</Text>
            </View>
            <View style={styles.statsHeaderRow}>
              <Text style={[styles.headerCell, styles.playerCell]}>Batter</Text>
              <Text style={styles.headerCell}>R</Text>
              <Text style={styles.headerCell}>B</Text>
              <Text style={styles.headerCell}>4s</Text>
              <Text style={styles.headerCell}>6s</Text>
              <Text style={styles.headerCell}>S/R</Text>
            </View>
          </LinearGradient>

          <View style={styles.statsBody}>
            {scoreData?.batsmen?.length > 0 ? (
              scoreData.batsmen.map((batsman: BatsmanType, index: number) => (
                <View
                  key={batsman.batsman_id}
                  style={[
                    styles.playerRow,
                    index % 2 === 1 && styles.playerRowAlt,
                    index === 0 && styles.activePlayerRow, // Highlight first batsman as striker
                  ]}
                >
                  <View style={styles.playerCell}>
                    <View
                      style={[
                        styles.playerAvatar,
                        index === 0 && styles.activePlayerAvatar, // Highlight striker avatar
                      ]}
                    >
                      <Text style={styles.playerAvatarText}>
                        {batsman.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{batsman.name}</Text>
                      <Text
                        style={[
                          styles.dismissalInfo,
                          index === 0 && styles.strikerInfo, // Special style for striker
                        ]}
                      >
                        {index === 0 ? "striker 🏏" : "non-striker"}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.statCell, styles.runsCell]}>
                    {batsman.runs}
                  </Text>
                  <Text style={styles.statCell}>{batsman.balls_faced}</Text>
                  <Text style={styles.statCell}>{batsman.fours}</Text>
                  <Text style={styles.statCell}>{batsman.sixes}</Text>
                  <Text style={[styles.statCell, styles.srCell]}>
                    {batsman.strike_rate}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No batsmen data available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bowling Stats Card */}
        <View style={styles.statsCard}>
          <LinearGradient
            colors={["#FFFFFF", "#F8F8F8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.statsHeader}
          >
            <View style={styles.statsTitleContainer}>
              <View style={styles.titleIconContainer}>
                <View style={[styles.titleIcon, styles.bowlingIcon]} />
              </View>
              <Text style={styles.statsTitle}>BOWLING</Text>
            </View>
            <View style={styles.statsHeaderRow}>
              <Text style={[styles.headerCell, styles.playerCell]}>Bowler</Text>
              <Text style={styles.headerCell}>O</Text>
              <Text style={styles.headerCell}>M</Text>
              <Text style={styles.headerCell}>R</Text>
              <Text style={styles.headerCell}>W</Text>
              <Text style={styles.headerCell}>ECO</Text>
            </View>
          </LinearGradient>

          <View style={styles.statsBody}>
            {scoreData?.bowlers?.length > 0 ? (
              scoreData.bowlers.map((bowler: BowlerType, index: number) => (
                <View
                  key={bowler.bowler_id}
                  style={[
                    styles.playerRow,
                    index % 2 === 1 && styles.playerRowAlt,
                    index === 0 && styles.activePlayerRow, // Highlight first bowler as current
                  ]}
                >
                  <View style={styles.playerCell}>
                    <View
                      style={[
                        styles.playerAvatar,
                        styles.bowlerAvatar,
                        index === 0 && styles.activeBowlerAvatar, // Highlight current bowler avatar
                      ]}
                    >
                      <Text style={styles.playerAvatarText}>
                        {bowler.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.playerInfo}>
                      <Text style={styles.playerName}>{bowler.name}</Text>
                      <Text
                        style={[
                          styles.bowlingInfo,
                          index === 0 && styles.currentBowlerInfo, // Special style for current bowler
                        ]}
                      >
                        {index === 0 ? "Bowling ⚾" : "Not Bowling"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.statCell}>{bowler.overs}</Text>
                  <Text style={styles.statCell}>{bowler.maidens}</Text>
                  <Text style={styles.statCell}>{bowler.runs_conceded}</Text>
                  <Text style={[styles.statCell, styles.wicketsCell]}>
                    {bowler.wickets}
                  </Text>
                  <Text style={[styles.statCell, styles.ecoCell]}>
                    {bowler.econ}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>No bowler data available</Text>
              </View>
            )}
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    marginTop: 12,
    color: "#e85d04",
    fontSize: 14,
    fontWeight: "500",
  },
  headerGradient: {
    paddingTop: Platform.OS === "ios" ? 50 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  matchTitleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  matchTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#50C878",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  inningsPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3182CE",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    marginLeft: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 3,
  },
  cricketBall: {
    width: 16,
    height: 16,
    marginRight: 6,
  },
  liveText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  inningsText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },

  // Score card styles
  matchStatusIndicator: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(80, 200, 120, 0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#50C878",
    marginRight: 6,
  },
  matchStatusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#50C878",
  },
  scoreCardGradient: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    position: "relative",
  },
  teamsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
  },
  teamSection: {
    flex: 1,
    alignItems: "center",
  },
  teamCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#F0F0F0",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  activeTeamCircle: {
    borderColor: "#e85d04",
    backgroundColor: "#FFF5EB",
  },
  teamCircleText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#666666",
  },
  activeTeamCircleText: {
    color: "#e85d04",
  },
  teamName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 10,
    textAlign: "center",
    width: "90%",
  },
  scoreContainer: {
    alignItems: "center",
  },
  scoreText: {
    fontSize: 32,
    fontWeight: "800",
    color: "#e85d04",
    marginBottom: 4,
    textShadowColor: "rgba(0, 0, 0, 0.1)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  oversText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#666666",
  },
  vsContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  vsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(232, 93, 4, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(232, 93, 4, 0.2)",
  },
  vsText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#e85d04",
  },
  infoBar: {
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(0, 0, 0, 0.1)",
  },
  statusGradient: {
    padding: 8,
    borderRadius: 10,
  },
  infoText: {
    fontSize: 14,
    color: "#555555",
    textAlign: "center",
    fontStyle: "italic",
  },

  // Stats container styles
  statsContainer: {
    flex: 1,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 7,
  },
  statsHeader: {
    padding: 16,
  },
  statsTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  titleIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(232, 93, 4, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  titleIcon: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#e85d04",
  },
  bowlingIcon: {
    backgroundColor: "#e85d04",
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333333",
    letterSpacing: 0.5,
  },
  statsHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  headerCell: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: "#666666",
    textAlign: "center",
  },
  playerCell: {
    flex: 3,
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 4,
  },
  statsBody: {
    backgroundColor: "#FFFFFF",
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.05)",
  },
  playerRowAlt: {
    backgroundColor: "#F8F8F8",
  },
  playerAvatar: {
    width: 20,
    height: 20,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  bowlerAvatar: {
    backgroundColor: "#FFE0CC",
  },
  playerAvatarText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#00000",
  },
  playerInfo: {
    flex: 1,
    flexShrink: 1,
    width: "100%",
  },
  playerName: {
    fontSize: 12,
    fontWeight: "600",
    flexShrink: 1,
    color: "#333333",
  },
  dismissalInfo: {
    fontSize: 12,
    color: "#48BB78",
    marginTop: 3,
    fontWeight: "500",
  },
  bowlingInfo: {
    fontSize: 12,
    color: "#F56565",
    marginTop: 3,
    fontWeight: "500",
  },
  playerHeaderCell: {
    flex: 3,
    textAlign: "left",
    paddingLeft: 4,
  },
  statCell: {
    flex: 1,
    fontSize: 12,
    color: "#555555",
    textAlign: "center",
    fontWeight: "500",
  },
  runsCell: {
    fontWeight: "700",
    color: "#3182CE",
  },
  wicketsCell: {
    fontWeight: "700",
    color: "#E53E3E",
  },
  srCell: {
    color: "#48BB78",
    fontWeight: "600",
  },
  ecoCell: {
    color: "#48BB78",
    fontWeight: "600",
  },
  noDataContainer: {
    padding: 24,
    alignItems: "center",
  },
  noDataText: {
    color: "#888888",
    fontSize: 14,
    fontStyle: "italic",
  },
  activePlayerRow: {
    backgroundColor: "rgba(232, 93, 4, 0.1)",
  },
  activePlayerAvatar: {
    backgroundColor: "#e85d04",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  activeBowlerAvatar: {
    backgroundColor: "#e85d04",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  strikerInfo: {
    color: "#e85d04",
    fontWeight: "700",
  },
  currentBowlerInfo: {
    color: "#e85d04",
    fontWeight: "700",
  },
});

export default LiveScorecard;
