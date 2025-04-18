import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { router } from 'expo-router';
interface FantasyPointsScreenProps {
  onClose?: () => void;
}

const FantasyPointsScreen = ({ onClose }: FantasyPointsScreenProps) => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.backButton}>
          <Text style={styles.backButtonText} onPress={() => router.back()}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>POINT SYSTEM</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.pointsSection}>
          <Text style={styles.sectionTitle}>IMPORTANT FANTASY POINTS</Text>
          
          <View style={styles.pointItem}>
            <View style={styles.pointLabel}>
              <Text style={styles.pointText}>Wicket</Text>
              <Text style={styles.subText}>(Excluding Run Out)</Text>
            </View>
            <Text style={styles.pointValue}>+25 pts</Text>
          </View>

          <View style={styles.pointItem}>
            <Text style={styles.pointText}>Run</Text>
            <Text style={styles.pointValue}>+1 pts</Text>
          </View>

          <View style={styles.pointItem}>
            <View style={styles.pointLabel}>
              <Text style={styles.pointText}>Four</Text>
            </View>
            <Text style={styles.pointValue}>+1 pts</Text>
          </View>

          <View style={styles.pointItem}>
            <View style={styles.pointLabel}>
              <Text style={styles.pointText}>Six</Text>
            </View>
            <Text style={styles.pointValue}>+2 pts</Text>
          </View>

          <View style={styles.pointItem}>
            <View style={styles.pointLabel}>
              <Text style={styles.pointText}>Maiden Over</Text>
            </View>
            <Text style={styles.pointValue}>+12 pts</Text>
          </View>
        </View>

        <View style={styles.categoriesSection}>
          <TouchableOpacity style={styles.category}>
            <Text style={styles.categoryText}>Batting</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.category}>
            <Text style={styles.categoryText}>Bowling</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.category}>
            <Text style={styles.categoryText}>Fielding</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.category}>
            <Text style={styles.categoryText}>Additional Points</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#1a1a1a',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
  },
  scrollView: {
    flex: 1,
  },
  pointsSection: {
    padding: 16,
  },
  sectionTitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  pointItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  pointLabel: {
    flex: 1,
  },
  pointText: {
    fontSize: 16,
    color: '#333',
  },
  subText: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  pointValue: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  categoriesSection: {
    padding: 16,
  },
  category: {
    padding: 16,
    backgroundColor: 'white',
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryText: {
    fontSize: 16,
    color: '#333',
  },
});

export default FantasyPointsScreen; 