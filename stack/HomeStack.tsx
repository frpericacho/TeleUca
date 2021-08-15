import React, { useState } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/Home';
import Search from '../screens/Search';
import Header from '../components/header';
import Chat from '../screens/Chat';

const Stack = createStackNavigator();

const HomeStack = ({navigation}:any) => {
  return (
    <Stack.Navigator screenOptions={{headerShown: true}}>
      <Stack.Screen options={{ headerTitle: () => <Header navigation = {navigation} Page={'Home'}/> }}
        name="Home" component={Home} />
      <Stack.Screen options={{header: () => null}}
        name="Search" component={Search} />
      <Stack.Screen options={{header: () => null}}
        name="Chat" component={Chat} />
    </Stack.Navigator>
  );
}

export default HomeStack;