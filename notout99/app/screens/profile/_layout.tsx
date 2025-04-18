import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
    }}>
      <Stack.Screen name="ProfileScreen" />
      <Stack.Screen name="EditProfile" />
      <Stack.Screen name="Winners" />
      <Stack.Screen name="Rewards" />
      <Stack.Screen name="HowToPlay" />
      
    </Stack>
  );
}