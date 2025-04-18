import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Image,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { fetchUserContests } from "../api/getapi/teamApi";
import { useRouter } from 'expo-router';

interface MyContestsScreenProps {
  matchId: string;
  onContestPress: (contestId: string) => void;
}

const MyContestsScreen = ({
  matchId,
  onContestPress,
}: MyContestsScreenProps) => {
  const router = useRouter();
  const { data, isLoading, error } = useQuery({
    queryKey: ["userContests", matchId],
    queryFn: () => fetchUserContests(matchId),
  });

  const userContests = data?.data || [];

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading your contests...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text>Error loading your contests. Please try again.</Text>
      </View>
    );
  }

  if (userContests.length === 0) {
    return (
      <View style={styles.noContestsContainer}>
        <Text style={styles.noContestsText}>
          You haven't joined any contests for this match yet.
        </Text>
        <TouchableOpacity style={styles.browseButton}>
          <Text style={styles.browseButtonText}>Browse Contests</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scrollContainer}
      contentContainerStyle={styles.contestsListContainer}
    >
      <Text style={styles.sectionTitle}>Your Joined Contests</Text>

      {userContests.map((contest) => (
        <TouchableOpacity
          key={contest._id}
          style={styles.contestCard}
          onPress={() => onContestPress(contest._id)}
        >
          <View style={styles.contestTypeContainer}>
            <Text style={styles.contestType}>{contest.contest_name}</Text>
            <Image
              source={require("@/assets/images/trophy.png")}
              style={styles.trophyIcon}
            />
          </View>

          <View style={styles.contestAmountRow}>
            <Text style={styles.amountText}>₹ {contest.totalPricePool}</Text>
            <View style={styles.entryBadge}>
              <Text style={styles.badgeText}>₹{contest.entry_fee}</Text>
            </View>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  {
                    width: `${
                      (contest.participants_count / contest.maxEntries) * 100
                    }%`,
                  },
                ]}
              />
            </View>
            <View style={styles.spotsContainer}>
              <Text style={styles.spotsText}>
                {contest.maxEntries - contest.participants_count} Left
              </Text>
              <Text style={styles.spotsText}>{contest.maxEntries} Spots</Text>
            </View>
          </View>

          <View style={styles.teamStatusContainer}>
            <Text style={styles.teamStatusText}>
              {contest.user_teams_count} Team
              {contest.user_teams_count !== 1 ? "s" : ""} Joined
            </Text>
            <TouchableOpacity 
              style={styles.viewTeamsButton}
              onPress={() => router.push(`/screens/team/ViewTeam?match_id=${matchId}&contest_id=${contest._id}`)}
            >
              <Text style={styles.viewTeamsButtonText}>View Teams</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      ))}

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  noContestsContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  noContestsText: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 20,
  },
  browseButton: {
    backgroundColor: "#e85d04",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  browseButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContainer: {
    flex: 1,
  },
  contestsListContainer: {
    padding: 15,
    paddingBottom: 80,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
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
    tintColor: "#FFD700",
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
    backgroundColor: "#f48c06",
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
  teamStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  teamStatusText: {
    fontSize: 14,
    color: "#555",
  },
  viewTeamsButton: {
    backgroundColor: "#f0f0f0",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  viewTeamsButtonText: {
    color: "#e85d04",
    fontSize: 12,
    fontWeight: "bold",
  },
  bottomPadding: {
    height: 60,
  },
});

export default MyContestsScreen;
