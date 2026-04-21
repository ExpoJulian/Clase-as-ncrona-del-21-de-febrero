import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { initDatabase } from './db/database';
import HomeScreen from './screens/HomeScreen';
import SettingsScreen from './screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const [dbReady, setDbReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        await initDatabase();
        setDbReady(true);
      } catch (e) {
        console.error('Error inicializando DB:', e);
        setError(e.message);
      }
    })();
  }, []);

  if (!dbReady && !error) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashIcon}>📝</Text>
        <Text style={styles.splashTitle}>NotasApp</Text>
        <ActivityIndicator color="#7C6AF7" size="large" style={{ marginTop: 30 }} />
        <Text style={styles.splashSub}>Iniciando base de datos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.splash}>
        <Text style={{ color: '#E05C6A', fontSize: 16, textAlign: 'center', padding: 20 }}>
          Error al iniciar: {error}
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#0F0F14',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashIcon: { fontSize: 64, marginBottom: 16 },
  splashTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#E8E8F0',
    letterSpacing: -0.5,
  },
  splashSub: {
    color: '#7A7A9A',
    fontSize: 14,
    marginTop: 12,
  },
});
