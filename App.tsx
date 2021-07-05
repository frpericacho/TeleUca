import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import Navigation from './stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';
import * as firebase from 'firebase'

const firebaseConfig = {
  apiKey: "AIzaSyB-aGJKOYjI-_Px4IzpWyxsLSuJ7qtRwqw",
  authDomain: "ucachat-fbf3c.firebaseapp.com",
  projectId: "ucachat-fbf3c",
  storageBucket: "ucachat-fbf3c.appspot.com",
  messagingSenderId: "629136872020",
  appId: "1:629136872020:web:d233ee4baece243bfc53c1"
};

if(firebase.default.apps.length == 0){
  firebase.default.initializeApp(firebaseConfig)
}

export default function App() {

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Navigation />
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