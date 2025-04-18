import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ImageSourcePropType,
} from "react-native";
import { useRouter } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

interface SportCategory {
  id: string;
  title: string;
  imageSource: ImageSourcePropType;
}

interface Winner {
  name: string;
  since: string;
  rank: number;
  amount: string;
  team: string;
}

interface Event {
  id: number;
  eventName: string;
  date: string;
  teams: { team1: string; team2: string };
  contestAmount: string;
  winners: Winner[];
}

const sportsCategories: SportCategory[] = [
  {
    id: "cricket",
    title: "Cricket",
    imageSource: require("../../../assets/images/cricketIcon.png"),
  },
  {
    id: "football",
    title: "Football",
    imageSource: require("../../../assets/images/footballIcon.png"),
  },
  {
    id: "basketball",
    title: "Basketball",
    imageSource: require("../../../assets/images/basketballIcon.png"),
  },
  {
    id: "hockey",
    title: "Hockey",
    imageSource: require("../../../assets/images/hockeyIcon.png"),
  },
];

const winnersList: Event[] = [
  {
    id: 1,
    eventName: "ICC Champions Trophy, 2025",
    date: "22, March 2025",
    teams: { team1: "India", team2: "Pakistan" },
    contestAmount: "₹30 Crores Contest",
    winners: [
      {
        name: "King Kumar",
        since: "2023",
        rank: 1,
        amount: "₹ 8 Lakhs",
        team: "Team 1",
      },
      {
        name: "Rani Devi",
        since: "2022",
        rank: 2,
        amount: "₹ 5 Lakhs",
        team: "Team 3",
      },
      {
        name: "Prince Singh",
        since: "2024",
        rank: 3,
        amount: "₹ 3 Lakhs",
        team: "Team 2",
      },
      {
        name: "Star Player",
        since: "2021",
        rank: 4,
        amount: "₹ 1 Lakh",
        team: "Team 4",
      },
    ],
  },
  {
    id: 2,
    eventName: "Premier League Finals, 2025",
    date: "15, May 2025",
    teams: { team1: "Man United", team2: "Liverpool" },
    contestAmount: "₹20 Crores Contest",
    winners: [
      {
        name: "Football Fan",
        since: "2020",
        rank: 1,
        amount: "₹ 6 Lakhs",
        team: "Team A",
      },
      {
        name: "Goal Master",
        since: "2023",
        rank: 2,
        amount: "₹ 4 Lakhs",
        team: "Team B",
      },
    ],
  },
];

const WinnersScreen = () => {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState("Cricket");

  const filteredWinnersList = winnersList; // In a real app, filter based on selectedSport

  return (
    <View style={styles.container}>
      <LinearGradient style={styles.header} colors={["#e85d04", "#fb923c"]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ArrowLeft color="#ffffff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Winners</Text>
        <View style={styles.placeholderRight} />
      </LinearGradient>

      <View style={styles.sportsCategories}>
        {sportsCategories.map((sport) => (
          <TouchableOpacity
            key={sport.id}
            style={[
              styles.sportCategory,
              selectedSport === sport.title && styles.selectedSport,
            ]}
            onPress={() => setSelectedSport(sport.title)}
          >
            <Image source={sport.imageSource} style={styles.sportIcon} />
            <Text
              style={[
                styles.sportCategoryText,
                selectedSport === sport.title && styles.selectedSportText,
              ]}
            >
              {sport.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.winnersListContainer}>
        {filteredWinnersList.map((event) => (
          <View key={event.id} style={styles.eventCard}>
            <View style={styles.eventHeader}>
              <Text style={styles.eventName}>{event.eventName}</Text>
              <Text style={styles.eventDate}>{event.date}</Text>
            </View>

            <View style={styles.teamsContainer}>
              <View style={styles.teamSection}>
                <Image
                  source={require("../../../assets/images/india.png")}
                  style={styles.teamLogo}
                />
                <Text style={styles.teamName}>{event.teams.team1}</Text>
              </View>

              <Text style={styles.vsText}>VS</Text>

              <View style={styles.teamSection}>
                <Image
                  source={require("../../../assets/images/pak.png")}
                  style={styles.teamLogo}
                />
                <Text style={styles.teamName}>{event.teams.team2}</Text>
              </View>
            </View>

            <View style={styles.contestButtons}>
              <TouchableOpacity style={styles.contestButton}>
                <Text style={styles.contestButtonText}>
                  {event.contestAmount}
                </Text>
              </TouchableOpacity>
            </View>

            {event.winners.map((winner, index) => (
              <View key={index} style={styles.winnerCard}>
                <View style={styles.winnerInfoContainer}>
                  <Image
                    source={require("../../../assets/images/player.png")}
                    style={styles.winnerAvatar}
                  />
                  <View style={styles.winnerInfo}>
                    <Text style={styles.winnerName}>{winner.name}</Text>
                    <Text style={styles.winnerSince}>
                      Playing since {winner.since}
                    </Text>
                  </View>
                </View>

                <View style={styles.winnerRankContainer}>
                  <View
                    style={[
                      styles.rankBadge,
                      winner.rank > 1 && styles.rankBadgeSecondary,
                    ]}
                  >
                    <Text
                      style={[
                        styles.rankText,
                        winner.rank > 1 && styles.rankTextSecondary,
                      ]}
                    >
                      #{winner.rank}
                    </Text>
                  </View>
                  <Text style={styles.winnerAmount}>{winner.amount}</Text>
                  <Text style={styles.winnerTeam}>{winner.team}</Text>
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#ffffff",
  },
  placeholderRight: {
    width: 40,
  },
  sportsCategories: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "#FFFFFF",
    justifyContent: "space-around", // Changed for better spacing
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  sportCategory: {
    flexDirection: "column",
    alignItems: "center",
    paddingHorizontal: 10, // Adjusted padding
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectedSport: {
    backgroundColor: "#E0E0E0", // Light grey for selected background
  },
  sportIcon: {
    width: 28, // Slightly larger icon
    height: 28,
    marginBottom: 4,
  },
  sportCategoryText: {
    color: "#555555", // Darker grey text
    fontSize: 12,
    fontWeight: "500",
  },
  selectedSportText: {
    color: "#000000", // Black text for selected
    fontWeight: "bold",
  },
  winnersListContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000", // Added subtle shadow for depth
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.15,
    shadowRadius: 2.0,
    elevation: 2,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  eventName: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "bold",
  },
  eventDate: {
    color: "#888888", // Lighter grey for date
    fontSize: 12,
  },
  teamsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
  },
  teamSection: {
    flexDirection: "column",
    alignItems: "center",
    flex: 1,
  },
  teamLogo: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  teamName: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "bold",
  },
  vsText: {
    color: "#AAAAAA",
    fontSize: 14, // Slightly smaller VS
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  contestButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 8, // Added gap for spacing
  },
  contestButton: {
    backgroundColor: "#E8E8E8", // Light grey background
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6, // Slightly rounder corners
    flex: 1,
    alignItems: "center",
  },
  contestButtonSecondary: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#D0D0D0",
  },
  contestButtonText: {
    color: "#444444", // Dark grey text
    fontSize: 12,
    fontWeight: "500",
  },
  contestButtonSecondaryText: {
    color: "#666666",
  },
  winnerCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F9F9F9", // Very light grey for winner card background
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#EDEDED",
  },
  winnerInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 3,
  },
  winnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  winnerInfo: {
    flex: 1,
  },
  winnerName: {
    color: "#222222", // Almost black for name
    fontSize: 14,
    fontWeight: "bold",
  },
  winnerSince: {
    color: "#777777", // Medium grey
    fontSize: 12,
  },
  winnerRankContainer: {
    flex: 2,
    alignItems: "flex-end",
  },
  rankBadge: {
    backgroundColor: "#FFD700", // Gold for Rank 1
    paddingVertical: 3, // Adjusted padding
    paddingHorizontal: 9,
    borderRadius: 12,
    marginBottom: 5, // Adjusted margin
  },
  rankBadgeSecondary: {
    backgroundColor: "#E0E0E0", // Grey for other ranks
  },
  rankText: {
    color: "#403000", // Darker text for gold badge
    fontWeight: "bold",
    fontSize: 12,
  },
  rankTextSecondary: {
    color: "#555555", // Dark grey for grey badge
  },
  winnerAmount: {
    color: "#4CAF50", // Keep green for amount
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2, // Added margin
  },
  winnerTeam: {
    color: "#888888",
    fontSize: 12,
  },
});

export default WinnersScreen;
