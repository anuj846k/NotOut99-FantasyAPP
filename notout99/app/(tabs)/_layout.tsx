import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Wallet,
  LayoutGrid,
  MessageCircle,
  User,
  Home,
  Users,
} from "lucide-react-native";
import WalletScreen from "../screens/wallet/WalletScreen";
import MatchesScreen from "../screens/matches/MatchesScreen";
import ProfileScreen from "../screens/profile/ProfileScreen";
import HomeScreen from "../screens/home/HomeScreen";
import ReferScreen from "../screens/wallet/Refer";

const Tab = createBottomTabNavigator();

const ICON_SIZE = 24;
const ACTIVE_COLOR = "#FF3B30";
const INACTIVE_COLOR = "#777";

const getTabIcon = (name: string, focused: boolean) => {
  const color = focused ? ACTIVE_COLOR : INACTIVE_COLOR;

  switch (name) {
    case "home":
      return <Home size={ICON_SIZE} color={color} />;
    case "wallet":
      return <Wallet size={ICON_SIZE} color={color} />;
    case "matches":
      return <LayoutGrid size={ICON_SIZE} color={color} />;
    case "Refer":
      return <Users size={ICON_SIZE} color={color} />;
    case "profile":
      return <User size={ICON_SIZE} color={color} />;
    default:
      return <Home size={ICON_SIZE} color={color} />;
  }
};

export default function TabLayout() {
  return (
    <Tab.Navigator
      id={undefined}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => getTabIcon(route.name, focused),
        tabBarStyle: { backgroundColor: "#FFF", height: 70, paddingBottom: 10 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
      })}
    >
      <Tab.Screen name="home" component={HomeScreen} />
      <Tab.Screen name="wallet" component={WalletScreen} />
      <Tab.Screen name="matches" component={MatchesScreen} />
      <Tab.Screen name="Refer" component={ReferScreen} />
      <Tab.Screen name="profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
