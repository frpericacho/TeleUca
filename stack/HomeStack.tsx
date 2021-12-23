import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/Home';
import Search from '../screens/Search';
import Header from '../components/header';
import Chat from '../screens/Chat';
import ChatOptions from '../screens/ChatOptions';
import UserProfileEdit from '../screens/UserProfileEdit';

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
      <Stack.Screen options={{header: () => null}}
        name="ChatOptions" component={ChatOptions} />
      <Stack.Screen options={{header: () => null}}
        name="UserProfileEdit" component={UserProfileEdit} />
    </Stack.Navigator>
  );
}

export default HomeStack;