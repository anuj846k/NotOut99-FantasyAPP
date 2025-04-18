import { Stack } from 'expo-router';

export default function WalletLayout() {
  return (
    <Stack screenOptions={{
      headerShown: false,
    }}>
      <Stack.Screen name="WalletScreen" />
      <Stack.Screen name="AddCash" />
      <Stack.Screen name="PaymentOptions" />
      <Stack.Screen name="Transactions" />
      <Stack.Screen name="Refer" />
      <Stack.Screen name="CoinsScreen" />
    </Stack>
  );
}