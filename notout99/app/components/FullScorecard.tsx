import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface BatsmanType {
  name: string;
  runs: string;
  balls_faced: string;
  fours: string;
  sixes: string;
  strike_rate: string;
  how_out: string;
}

interface BowlerType {
  name: string;
  overs: string;
  maidens: string;
  runs_conceded: string;
  wickets: string;
  econ: string;
}

const TeamScorecard = ({ innings, isExpanded, onToggle }) => {
  const rotateAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isExpanded]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <View style={styles.teamCard}>
      <TouchableOpacity onPress={onToggle} style={styles.teamHeader}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{innings.name}</Text>
          <Text style={styles.teamScore}>{innings.scores_full}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <Ionicons name="chevron-down" size={24} color="#666" />
        </Animated.View>
      </TouchableOpacity>

      {isExpanded && (
        <View style={styles.scoreDetails}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.battingTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.playerCell]}>Batter</Text>
                <Text style={styles.headerCell}>R</Text>
                <Text style={styles.headerCell}>B</Text>
                <Text style={styles.headerCell}>4s</Text>
                <Text style={styles.headerCell}>6s</Text>
                <Text style={styles.headerCell}>SR</Text>
              </View>
              {innings.batsmen.map((batsman: BatsmanType, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <View style={styles.playerInfo}>
                    <View style={styles.playerAvatar}>
                      <Text style={styles.playerAvatarText}>
                        {batsman.name.charAt(0)}
                      </Text>
                    </View>
                    <View style={styles.playerDetails}>
                      <Text style={styles.playerName}>{batsman.name}</Text>
                      <Text style={styles.dismissalText}>{batsman.how_out}</Text>
                    </View>
                  </View>
                  <Text style={styles.cell}>{batsman.runs}</Text>
                  <Text style={styles.cell}>{batsman.balls_faced}</Text>
                  <Text style={styles.cell}>{batsman.fours}</Text>
                  <Text style={styles.cell}>{batsman.sixes}</Text>
                  <Text style={styles.cell}>{batsman.strike_rate}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <View style={styles.sectionDivider} />

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.bowlingTable}>
              <View style={styles.tableHeader}>
                <Text style={[styles.headerCell, styles.playerCell]}>Bowler</Text>
                <Text style={styles.headerCell}>O</Text>
                <Text style={styles.headerCell}>M</Text>
                <Text style={styles.headerCell}>R</Text>
                <Text style={styles.headerCell}>W</Text>
                <Text style={styles.headerCell}>ECO</Text>
              </View>
              {innings.bowlers.map((bowler: BowlerType, index: number) => (
                <View key={index} style={styles.tableRow}>
                  <View style={styles.playerInfo}>
                    <View style={[styles.playerAvatar, styles.bowlerAvatar]}>
                      <Text style={styles.playerAvatarText}>
                        {bowler.name.charAt(0)}
                      </Text>
                    </View>
                    <Text style={styles.playerName}>{bowler.name}</Text>
                  </View>
                  <Text style={styles.cell}>{bowler.overs}</Text>
                  <Text style={styles.cell}>{bowler.maidens}</Text>
                  <Text style={styles.cell}>{bowler.runs_conceded}</Text>
                  <Text style={styles.cell}>{bowler.wickets}</Text>
                  <Text style={styles.cell}>{bowler.econ}</Text>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const FullScorecard = ({ matchId }) => {
  const [scoreData, setScoreData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  // Change expandedInnings from array to single number
  const [expandedInnings, setExpandedInnings] = useState<number | null>(null);

  useEffect(() => {
    const fetchScorecard = async () => {
      try {
        const response = await fetch(
          `https://rest.entitysport.com/v2/matches/${matchId}/scorecard?token=${process.env.NEXT_PUBLIC_API_KEY}`
        );
        const data = await response.json();
        setScoreData(data.response);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching scorecard:', error);
        setLoading(false);
      }
    };

    fetchScorecard();
    const interval = setInterval(fetchScorecard, 30000);
    return () => clearInterval(interval);
  }, [matchId]);

  const toggleInnings = (inningNumber: number) => {
    setExpandedInnings(prev => prev === inningNumber ? null : inningNumber);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E4A11B" />
        <Text style={styles.loadingText}>Loading scorecard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#FF8C00', '#e85d04']}
        style={styles.headerGradient}
      >
        <Text style={styles.matchTitle}>{scoreData.title}</Text>
        <Text style={styles.matchStatus}>{scoreData.status_note}</Text>
      </LinearGradient>

      {scoreData.innings.map((innings: any, index: number) => (
        <TeamScorecard
          key={innings.iid}
          innings={innings}
          isExpanded={expandedInnings === index}
          onToggle={() => toggleInnings(index)}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  matchTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  matchStatus: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
  },
  teamCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  teamScore: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  scoreDetails: {
    padding: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerCell: {
    width: 50,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  playerCell: {
    width: 200,
    paddingLeft: 8,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  playerInfo: {
    width: 200,
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  playerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#e85d04',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  playerAvatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  playerDetails: {
    flex: 1,
  },
  playerName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  dismissalText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  cell: {
    width: 50,
    textAlign: 'center',
    fontSize: 14,
    color: '#333',
  },
  bowlerAvatar: {
    backgroundColor: '#3182ce',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 16,
  },
  battingTable:{
    marginBottom: 10,
  },
  bowlingTable:{
    marginBottom: 10,
  }
});

export default FullScorecard;