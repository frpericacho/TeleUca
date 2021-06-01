import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import Navigation from './stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider } from './lib/AuthProvider';
import'react-native-url-polyfill/auto';

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <AuthProvider>
        <Navigation />
      </AuthProvider>
      <StatusBar />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});