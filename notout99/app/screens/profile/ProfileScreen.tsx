import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  ArrowLeft,
  Edit,
  Wallet,
  Award,
  Gift,
  GamepadIcon,
  HelpCircle,
  LogOut,
  ChevronRight,
  SquareUser 
} from "lucide-react-native";
import { fetchUserData, logoutUser } from "@/app/store/UserSlice";
import { useAppDispatch, useAppSelector } from "@/app/store/index";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const ProfileScreen = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { userData, loading, error } = useAppSelector((state) => state.user);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadUserData();
  }, [dispatch]);

  const loadUserData = async () => {
    setIsRefreshing(true);
    try {
      await dispatch(fetchUserData()).unwrap();
      console.log("userData :", userData);
    } catch (error) {
      console.error("Failed to load user data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = async () => {
    try {
      // setLoading(true);
      await dispatch(logoutUser()).unwrap();
      Alert.alert("Logout successful", "Logout successful");
      router.replace("/(auth)/login"); // Navigate to login screen after logout
    } catch (error) {
      console.error("Logout failed:", error);
      Alert.alert("Logout Failed", "Unable to logout");
    }
  };

  const menuItems = [
    {
      id: "edit",
      title: "Edit User Info",
      icon: <Edit size={20} color="#333" />,
      rightIcon: <ChevronRight size={20} color="#999" />,
      onPress: () => router.push("/screens/profile/EditProfile"),
    },
    {
      id: "wallet",
      title: "My Wallet",
      icon: <Wallet size={20} color="#333" />,
      rightIcon: <ChevronRight size={20} color="#999" />,
      onPress: () => router.push("/screens/wallet/WalletScreen"),
    },
    {
      id: "transactions",
      title: "Transaction History",
      icon: <MaterialCommunityIcons name="history" size={20} color="#333" />,
      rightIcon: <ChevronRight size={20} color="#999" />,
      onPress: () => router.push("/screens/wallet/Transactions"),
    },
    {
      id: "premium",
      title: "Verify Account",
      icon: <SquareUser size={20} color="#333" />,
      rightIcon: <ChevronRight size={20} color="#999" />,
      onPress: () => router.push("/screens/profile/VerifyAccount"),
    },
    {
      id: "winners",
      title: "Winners",
      icon: <Award size={20} color="#333" />,
      rightIcon: <ChevronRight size={20} color="#999" />,
      onPress: () => router.push("/screens/profile/Winners"),
    },
    {
      id: "rewards",
      title: "Rewards",
      icon: <Gift size={20} color="#333" />,
      rightIcon: <ChevronRight size={20} color="#999" />,
      onPress: () => router.push("/screens/profile/Rewards"),
    },
    {
      id: "howtoplay",
      title: "How to play",
      icon: <GamepadIcon size={20} color="#333" />,
      rightIcon: <ChevronRight size={20} color="#999" />,
      onPress: () => router.push("/screens/profile/HowToPlay"),
    },
    {
      id: "help",
      title: "24×7 Help & Support",
      icon: <HelpCircle size={20} color="#333" />,
      rightIcon: <ChevronRight size={20} color="#999" />,
      onPress: () => {},
    },
    {
      id: "logout",
      title: "Logout",
      icon: <LogOut size={20} color="#333" />,
      rightIcon: <ChevronRight size={20} color="#999" />,
      onPress: handleLogout,
    },
  ];

  if (loading && !isRefreshing) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#e85d04" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (error && !userData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>Failed to load profile data</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
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
          <Text style={styles.headerTitle}>My Profile</Text>
          {isRefreshing && (
            <ActivityIndicator
              size="small"
              color="#fff"
              style={styles.refreshIndicator}
            />
          )}
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <Image
                source={{
                  uri:
                    userData?.avatar ||
                    "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
                }}
                style={styles.avatar}
              />
              <TouchableOpacity style={styles.editAvatarButton}>
                <MaterialCommunityIcons name="camera" size={16} color="#fff" />
              </TouchableOpacity>
            </View>
            <Text style={styles.userName}>
              {userData?.firstName && userData?.lastName
                ? `${userData.firstName} ${userData.lastName}`
                : userData?.firstName
                ? userData.firstName
                : userData?.phoneNumber
                ? `${userData.phoneNumber}`
                : "Guest User"}
            </Text>
            {userData?.phoneNumber && (
              <Text style={styles.userPhone}>Phone: {userData.phoneNumber}</Text>
            )}
            {userData?.createdAt && (
              <Text style={styles.userJoined}>
                Joined: {new Date(userData.createdAt).toLocaleDateString()}
              </Text>
            )}
          </View>

          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              <React.Fragment key={item.id}>
                <TouchableOpacity style={styles.menuItem} onPress={item.onPress}>
                  <View style={styles.menuItemLeft}>
                    {item.icon}
                    <Text style={styles.menuItemText}>{item.title}</Text>
                  </View>
                  <View style={styles.menuItemRight}>{item.rightIcon}</View>
                </TouchableOpacity>
                {index < menuItems.length - 1 && <View style={styles.divider} />}
              </React.Fragment>
            ))}
          </View>

          <View style={styles.footer}>
            <View style={styles.homeIndicator} />
          </View>
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  safeContainer: {
    flex: 1,
    backgroundColor: "#fff",
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
  profileHeader: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#fff",
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: "#e85d04",
    backgroundColor: "#f0f0f0",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#e85d04",
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  userName: {
    fontSize: 20,
    fontWeight: "600",
    color: "#000",
    marginTop: 12,
  },
  menuContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  menuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  menuItemText: {
    fontSize: 16,
    color: "#333",
  },
  menuItemRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  balanceText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginRight: 8,
  },
  divider: {
    height: 1,
    backgroundColor: "#e2e8f0",
  },
  footer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  homeIndicator: {
    width: 134,
    height: 5,
    backgroundColor: "#ddd",
    borderRadius: 2.5,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: "#e85d04",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  refreshIndicator: {
    position: "absolute",
    right: 16,
    top: Platform.OS === "ios" ? 48 : 16,
  },
  userPhone: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  userJoined: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  scrollContent: {
    flexGrow: 1,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    justifyContent: "space-between",
    elevation: 1,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "600",
    color: "#e85d04",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  dividerVertical: {
    width: 1,
    height: "80%",
    backgroundColor: "#e2e8f0",
    alignSelf: "center",
  },
});
