import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  StatusBar,
  Image,
  ScrollView
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { router } from 'expo-router';

const HowToPlayScreen = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>How To Play</Text>
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, styles.activeTab]}>
          <Text style={[styles.tabText, styles.activeTabText]}>T20</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>T10</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>ODI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tab}>
          <Text style={styles.tabText}>TEST</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.scrollView}>
        <TouchableOpacity style={styles.pointsCard}>
          <View style={styles.pointsHeaderRow}>
            <View style={styles.pointsIconContainer}>
              <Icon name="star" size={20} color="#FF9500" />
            </View>
            <Text style={styles.pointsTitle}>FANTASY POINTS</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#333" style={styles.chevron} />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.pointsCard}>
          <View style={styles.pointsHeaderRow}>
            <View style={styles.pointsIconContainer}>
              <Icon name="monetization-on" size={20} color="#FFD700" />
            </View>
            <Text style={styles.pointsTitle}>OTHER IMP POINTS</Text>
          </View>
          <Icon name="chevron-right" size={24} color="#333" style={styles.chevron} />
        </TouchableOpacity>
      </ScrollView>
      <View style={styles.homeIndicator} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E86C1',
    paddingVertical: 15,
    paddingHorizontal: 15,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#2E86C1',
  },
  tabText: {
    fontSize: 14,
    color: '#777777',
  },
  activeTabText: {
    color: '#2E86C1',
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  pointsCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#E8F6FF',
    marginHorizontal: 0,
    marginVertical: 8,
    borderRadius: 4,
  },
  pointsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsIconContainer: {
    marginRight: 10,
  },
  pointsTitle: {
    fontWeight: 'bold',
    color: '#333333',
    fontSize: 16,
  },
  chevron: {
    marginLeft: 'auto',
  },
  homeIndicator: {
    width: 100,
    height: 5,
    backgroundColor: '#CCCCCC',
    borderRadius: 3,
    alignSelf: 'center',
    marginBottom: 8,
    marginTop: 5,
  },
});

export default HowToPlayScreen;