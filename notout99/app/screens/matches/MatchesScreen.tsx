/** @format */

import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMyMatches } from "@/app/api/getapi/getApi";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { ArrowLeft } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

const MatchesScreen = () => {
  const router = useRouter();
  const [selectedSport, setSelectedSport] = useState<number | null>(null);

  const sports = [
    { id: 1, name: "Cricket", icon: "cricket", active: false },
    { id: 2, name: "Football", icon: "soccer", active: false },
    { id: 3, name: "Basketball", icon: "basketball", active: false },
    { id: 4, name: "Hockey", icon: "hockey-sticks", active: false },
  ];
  const { data, isLoading, error } = useQuery({
    queryKey: ["myMatches"],
    queryFn: fetchMyMatches,
  });

  const myMatches = data?.myMatches || [];

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Loading matches...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text>Error loading matches. Please try again.</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeContainer} edges={['right', 'left', 'bottom']}>
      <ScrollView style={styles.container}>
        <LinearGradient colors={["#e85d04", "#fb923c"]} style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <ArrowLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>MY MATCHES</Text>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
          <View style={styles.matchesSection}>
            {myMatches
              .filter((match) => !selectedSport || match.sport_id === selectedSport)
              .map((match: any, index: number) => (
                <Link
                  href={`/screens/contest/${match._id}`}
                  key={index}
                  style={styles.matchCard}
                >
                  <View style={{ width: "100%", marginBottom: 0 }}>
                    <Text style={[styles.tournamentName, { marginBottom: 10 }]}>
                      {match.competition.title}
                    </Text>
                  </View>
                  <View style={styles.matchInfo}>
                    <View style={styles.teamInfo}>
                      <View style={styles.teamCircle}>
                        <Image
                          source={{ uri: match.teama.logo_url }}
                          width={40}
                          height={40}
                        />
                      </View>
                      <Text style={styles.teamName}>{match.teama.name}</Text>
                    </View>
                    <View style={styles.matchTimeInfo}>
                      <Text style={styles.matchDate}>{match.date_start_ist}</Text>
                    </View>
                    <View style={styles.teamInfo}>
                      <View style={styles.teamCircle}>
                        <Image
                          source={{ uri: match.teamb.logo_url }}
                          width={40}
                          height={40}
                        />
                      </View>
                      <Text style={styles.teamName}>{match.teamb.name}</Text>
                    </View>
                  </View>
                  {/* {match.prize && (
                <View style={styles.prizeInfo}>
                  <Text style={styles.prizeText}>Prize: ₹ {match.prize}</Text>
                </View>
              )} */}
              </Link>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MatchesScreen;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 30,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    left: 16,
    top: Platform.OS === "ios" ? 60 : 30,
    zIndex: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
    marginLeft: 24, // Add some margin to account for the back button
  },
  scrollContent: {
    flexGrow: 1,
  },
  sportsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "white",
  },
  sportItem: {
    alignItems: "center",
  },
  sportIcon: {
    fontSize: 24,
    marginBottom: 5,
  },
  sportName: {
    fontSize: 12,
    color: "#333",
  },
  matchesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  matchCard: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  tournamentName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
    color: "#333",
  },
  matchInfo: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    marginBottom: 15,
  },
  teamInfo: {
    alignItems: "center",
    flex: 1,
  },
  teamCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  teamName: {
    fontSize: 14,
    textAlign: "center",
    color: "#333",
  },
  matchTimeInfo: {
    alignItems: "center",
    flex: 1,
    marginTop: 20,
  },
  matchDate: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  countdown: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginVertical: 5,
  },
  matchTime: {
    fontSize: 14,
    color: "#666",
  },
  prizeInfo: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eee",
    paddingTop: 10,
  },
  prizeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  selectedSport: {
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 8,
  },
  activeSport: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 8,
  },
  activeSportText: {
    color: '#e85d04',
  }
});
