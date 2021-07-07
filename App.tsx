import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import Navigation from './stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';
import * as firebase from 'firebase'

const firebaseConfig = {
  apiKey: "AIzaSyBe5z0ysKIyS9m6_FdGOwq67sNUgJsfnKY",
  authDomain: "ucachat-f2d20.firebaseapp.com",
  projectId: "ucachat-f2d20",
  storageBucket: "ucachat-f2d20.appspot.com",
  messagingSenderId: "167756626914",
  appId: "1:167756626914:web:f423ea91c85a3be12c57bb"

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