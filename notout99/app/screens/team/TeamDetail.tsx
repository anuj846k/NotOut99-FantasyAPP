import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import TeamDetail from '@/app/components/TeamDetail';

// Add this import for getting team details
import { getTeamDetails } from '@/app/api/getapi/teamApi';

const TeamDetailScreen = () => {
  const router = useRouter();
  const { team_id } = useLocalSearchParams() as { team_id: string };
  
  const [loading, setLoading] = useState(true);
  const [team, setTeam] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        setLoading(true);
        
        // Call API to get team details
        const response = await getTeamDetails(team_id);
        
        if (response.success) {
          setTeam(response.data);
        } else {
          setError('Failed to fetch team details');
        }
      } catch (err) {
        console.error('Error fetching team details:', err);
        setError('An error occurred while fetching team details');
      } finally {
        setLoading(false);
      }
    };

    if (team_id) {
      fetchTeamDetails();
    } else {
      setError('No team ID provided');
      setLoading(false);
    }
  }, [team_id]);

  const handleClose = () => {
    router.back();
  };

  const handleEditTeam = () => {
    // Navigate to edit team screen if needed
    // router.push(`/screens/team/EditTeam?team_id=${team_id}`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#e85d04" />
        <Text style={styles.loadingText}>Loading team details...</Text>
      </View>
    );
  }

  if (error || !team) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error || 'Team not found'}</Text>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <TeamDetail 
      team={team} 
      onClose={handleClose}
      onEditTeam={handleEditTeam}
    />
  );
};

const styles = StyleSheet.create({
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
  backButton: {
    backgroundColor: '#e85d04',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  backButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TeamDetailScreen; 