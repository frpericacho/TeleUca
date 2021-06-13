import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/Home';
import SecondHome from '../screens/SecondHome';
import Header from '../components/header';
import Chat from '../screens/Chat';

const Stack = createStackNavigator();

const HomeStack = ({navigation}:any) => {
  return (
    <Stack.Navigator screenOptions={{headerShown: true}}>
      <Stack.Screen options={{ headerTitle: () => <Header navigation = {navigation} hideMenu = {false} searchBar={false}/> }}
        name="Home" component={Home} />
      <Stack.Screen options={{ headerTitle: () => <Header navigation = {navigation} hideMenu = {true} searchBar={true}/> }}
        name="SecondHome" component={SecondHome} />
      <Stack.Screen options={{ headerTitle: () => <Header navigation = {navigation} hideMenu = {true} searchBar={false}/> }}
        name="Chat" component={Chat} />
    </Stack.Navigator>
  );
}

export default HomeStack;