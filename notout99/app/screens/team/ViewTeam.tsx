import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getUserTeamsForContest } from '@/app/api/getapi/teamApi';

const ViewTeam = () => {
  const router = useRouter();
  const { match_id, contest_id } = useLocalSearchParams() as {
    match_id: string;
    contest_id: string;
  };

  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await getUserTeamsForContest(match_id, contest_id);
        if (response.success) {
          setTeams(response.data);
        } else {
          setError('Failed to fetch teams');
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('An error occurred while fetching your teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [match_id, contest_id]);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e85d04" />
        <Text style={styles.loadingText}>Loading your teams...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (teams.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.noTeamsText}>You don't have any teams for this contest yet.</Text>
        <TouchableOpacity 
          style={styles.createTeamButton}
          onPress={() => router.push(`/screens/team/CreateTeam?match_id=${match_id}&contest_id=${contest_id}`)}
        >
          <Text style={styles.createTeamButtonText}>Create a Team</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backArrow}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Your Teams</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {teams.map((team, index) => (
          <View key={team._id} style={styles.teamCard}>
            <View style={styles.teamHeader}>
              <Text style={styles.teamName}>{team.name}</Text>
              <View style={styles.teamRankContainer}>
                <Text style={styles.teamRankLabel}>Rank</Text>
                <Text style={styles.teamRank}>{team.rank || '-'}</Text>
              </View>
            </View>
            
            <View style={styles.playersContainer}>
              {/* Display players here */}
              <Text style={styles.playersSectionTitle}>Players</Text>
              
              {team.players.map((player) => (
                <View key={player.player_id._id} style={styles.playerRow}>
                  <Text style={styles.playerName}>
                    {player.player_id.name}
                    {player.is_captain ? ' (C)' : player.is_vice_captain ? ' (VC)' : ''}
                  </Text>
                  <Text style={styles.playerPoints}>{player.player_id.fantasy_points || 0} pts</Text>
                </View>
              ))}
            </View>
            
            <View style={styles.teamFooter}>
              <Text style={styles.teamPoints}>Total Points: {team.total_points || 0}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#e85d04',
    paddingTop: 50,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  backButton: {
    padding: 5,
  },
  backArrow: {
    fontSize: 24,
    color: 'white',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 15,
  },
  scrollView: {
    flex: 1,
    padding: 15,
  },
  teamCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  teamRankContainer: {
    alignItems: 'center',
  },
  teamRankLabel: {
    fontSize: 12,
    color: '#666',
  },
  teamRank: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e85d04',
  },
  playersContainer: {
    marginVertical: 10,
  },
  playersSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#444',
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  playerName: {
    fontSize: 14,
    color: '#333',
  },
  playerPoints: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e85d04',
  },
  teamFooter: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  teamPoints: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 16,
    color: '#ff5252',
    textAlign: 'center',
    marginBottom: 20,
  },
  noTeamsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  createTeamButton: {
    backgroundColor: '#e85d04',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  createTeamButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ViewTeam; 