import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet } from 'react-native';
import Navigation from './stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import 'react-native-url-polyfill/auto';
import * as firebase from 'firebase'
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotificationsAsync () {
  let token:any;
  if (Constants.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    token = (await Notifications.getExpoPushTokenAsync()).data;
  } else {
    alert('Must use physical device for Push Notifications');
  }

  if(token){
    firebase.default.firestore().collection('users').where('email','==',firebase.default.auth().currentUser?.email).get().then((doc)=>{
      firebase.default.firestore().collection('users').doc(doc.docs[0].id).update({token: token})
    })
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}

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
  registerForPushNotificationsAsync()
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