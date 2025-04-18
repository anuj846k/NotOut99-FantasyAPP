/** @format */

import {
  StyleSheet,
  Text,
  View,
  Image,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import React from "react";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { fetchContestByMatch } from "@/app/api/getapi/getApi";
import { useRouter } from "expo-router";
import MyContestsScreen from "@/app/components/MyContestsScreen";
import TeamsList from "@/app/components/TeamsList";
import { LinearGradient } from "expo-linear-gradient";
import LiveScorecard from "@/app/components/LiveScorecard";
import { ArrowLeft } from "lucide-react-native";

const ContestPage = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams() as { id: string };
  const [activeTab, setActiveTab] = React.useState("contests");

  const { data } = useQuery({
    queryKey: ["contestByMatch", id],
    queryFn: () => fetchContestByMatch(id),
  });

  const contests = data?.contests || [];
  const matchDetails = data?.match_details;
  const entitySportMatchId =
    matchDetails?.match_id || matchDetails?.entitySportMatchId;
  // Update the handleContestPress function
  const handleContestPress = (contestId: string) => {
    if (activeTab === "contests") {
      // Find the contest data from our contests array
      const selectedContest = contests.find(
        (contest) => contest._id === contestId
      );
      if (!selectedContest) return;

      // Navigate to payment screen with all necessary data
      router.replace({
        pathname: "/screens/contest/PayWithCoinsScreen",
        params: {
          match_id: id,
          contest_id: contestId,
          contest_name: selectedContest.contest_name,
          entry_fee: selectedContest.entry_fee,
          total_prize: selectedContest.totalPricePool,
        },
      });
    } else if (activeTab === "myContests") {
      router.replace({
        pathname: "/screens/team/ViewTeam",
        params: { match_id: id, contest_id: contestId },
      });
    }
  };

  const handleCreateTeamPress = () => {
    router.replace(`/screens/team/CreateTeam?match_id=${id}`);
  };

  const handleTeamPress = (teamId: string) => {
    // Navigate to team detail screen
    router.replace(`/screens/team/TeamDetail?team_id=${teamId}`);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#e85d04", "#f48c06"]}
        style={styles.headerContainer}
      >
        <View style={styles.header}>
        <TouchableOpacity onPress={()=>router.back()} style={styles.backButton}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>

          <View style={styles.matchInfoContainer}>
            <Image
              source={{ uri: matchDetails?.teama?.logo_url }}
              style={styles.teamLogo}
            />
            <Text style={styles.matchTitle}>
              {matchDetails?.teama?.short_name} vs{" "}
              {matchDetails?.teamb?.short_name}
            </Text>
            <Image
              source={{ uri: matchDetails?.teamb?.logo_url }}
              style={styles.teamLogo}
            />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={activeTab === "contests" ? styles.tabActive : styles.tab}
          onPress={() => setActiveTab("contests")}
        >
          <Text
            style={
              activeTab === "contests" ? styles.tabTextActive : styles.tabText
            }
          >
            Contests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={activeTab === "myContests" ? styles.tabActive : styles.tab}
          onPress={() => setActiveTab("myContests")}
        >
          <Text
            style={
              activeTab === "myContests" ? styles.tabTextActive : styles.tabText
            }
          >
            My Contests
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={activeTab === "teams" ? styles.tabActive : styles.tab}
          onPress={() => setActiveTab("teams")}
        >
          <Text
            style={
              activeTab === "teams" ? styles.tabTextActive : styles.tabText
            }
          >
            Teams
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={activeTab === "scorecard" ? styles.tabActive : styles.tab}
          onPress={() => setActiveTab("scorecard")}
        >
          <Text
            style={
              activeTab === "scorecard" ? styles.tabTextActive : styles.tabText
            }
          >
            Scorecard
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === "contests" && (
        <>
          <Text style={styles.sectionTitle}>Select a contest to join</Text>

          {contests.length === 0 ? (
            <View style={styles.noContestsContainer}>
              <Text style={styles.noContestsText}>
                No contests available for this match yet.
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.scrollContainer}
              contentContainerStyle={styles.contestsListContainer}
            >
              {/* Ongoing Contests section */}
              <View style={styles.categorySectionHeader}>
                <Text style={styles.categoryTitle}>Ongoing Contests</Text>
                <TouchableOpacity>
                  <Text style={styles.viewAllText}>View all</Text>
                </TouchableOpacity>
              </View>

              {contests.map((contest) => (
                <TouchableOpacity
                  key={contest._id}
                  style={styles.contestCard}
                  onPress={() => handleContestPress(contest._id)}
                >
                  <View style={styles.contestTypeContainer}>
                    <Text style={styles.contestType}>
                      {contest.contest_name}
                    </Text>
                    <Image
                      source={require("@/assets/images/trophy.png")}
                      style={styles.trophyIcon}
                    />
                  </View>

                  <View style={styles.contestAmountRow}>
                    <Text style={styles.amountText}>
                      ₹ {contest.totalPricePool}
                    </Text>
                    <View style={styles.entryBadge}>
                      <Text style={styles.badgeText}>
                        {contest.entry_fee} coins
                      </Text>
                    </View>
                  </View>
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            width: `${
                              (contest.participants_count /
                                contest.maxEntries) *
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

                  <View style={styles.prizeInfoContainer}>
                    <View style={styles.prizeInfo}>
                      <Text style={styles.prizeInfoLabel}>1st Prize:</Text>
                      <Text style={styles.prizeInfoValue}>
                        ₹ {contest.firstPrice}
                      </Text>
                    </View>
                    <View style={styles.prizeInfo}>
                      <Text style={styles.prizeInfoLabel}>2nd Prize:</Text>
                      <Text style={styles.prizeInfoValue}>
                        ₹ {contest.secondPrice}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.joinButtonContainer}>
                    <Text style={styles.joinButtonText}>JOIN CONTEST</Text>
                  </View>
                </TouchableOpacity>
              ))}

              <View style={styles.bottomPadding} />
            </ScrollView>
          )}
        </>
      )}

      {activeTab === "myContests" && (
        <MyContestsScreen matchId={id} onContestPress={handleContestPress} />
      )}

      {activeTab === "teams" && (
        <TeamsList
          matchId={id}
          onTeamPress={handleTeamPress}
          showCreateTeamButton={true}
          onCreateTeamPress={handleCreateTeamPress}
        />
      )}

      {activeTab === "scorecard" && entitySportMatchId && (
        <LiveScorecard matchId={entitySportMatchId} />
      )}
    </View>
  );
};

export default ContestPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  headerContainer: {
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 16,
  },
  matchInfoContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  teamLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "white",
  },
  matchTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginHorizontal: 10,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
  },
  tabActive: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#e85d04",
  },
  tabText: {
    color: "#888",
    fontSize: 15,
  },
  tabTextActive: {
    color: "#e85d04",
    fontSize: 15,
    fontWeight: "bold",
  },
  sectionTitle: {
    textAlign: "center",
    paddingVertical: 15,
    fontSize: 16,
    color: "#555",
  },
  scrollContainer: {
    flex: 1,
  },
  noContestsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  timerImage: {
    width: 150,
    height: 150,
    marginBottom: 20,
    opacity: 0.8,
  },
  noContestsText: {
    fontSize: 18,
    color: "#444",
    textAlign: "center",
    lineHeight: 24,
  },
  contestsListContainer: {
    padding: 15,
    paddingBottom: 80, // Add extra padding at the bottom
  },
  bottomPadding: {
    height: 60, // Extra space at the bottom to ensure content doesn't hide behind the button
  },
  categorySectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  viewAllText: {
    fontSize: 14,
    color: "#e85d04",
  },
  contestCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  contestCardHeader: {
    marginBottom: 8,
  },
  contestTypeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  contestType: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  trophyIcon: {
    width: 20,
    height: 20,
    marginLeft: 5,
    tintColor: "#FFD700", // Add gold color to trophy
  },
  contestAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 5,
  },
  amountText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  entryBadge: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 15,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: "bold",
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
  prizeInfoContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(232, 93, 4, 0.1)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 15,
    justifyContent: "space-between",
    marginTop: 8,
  },
  prizeInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  prizeInfoLabel: {
    fontSize: 14,
    color: "#666",
    marginRight: 5,
  },
  prizeInfoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  createTeamButton: {
    position: "absolute",
    bottom: 25,
    left: "50%",
    transform: [{ translateX: -Dimensions.get("window").width * 0.4 }],
    backgroundColor: "#e85d04",
    paddingVertical: 12,
    width: Dimensions.get("window").width * 0.8,
    borderRadius: 25,
    alignItems: "center",
  },
  createTeamButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  joinButtonContainer: {
    backgroundColor: "#e85d04",
    padding: 8,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 10,
  },
  joinButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
});
