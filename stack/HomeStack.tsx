import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/Home';
import SecondHome from '../screens/SecondHome';
import Header from '../components/header';

const Stack = createStackNavigator();

const HomeStack = ({navigation}:any) => {
  return (
    <Stack.Navigator screenOptions={{headerShown: true}}>
      {/*<Stack.Screen options={{headerTitle: Header}}*/}
      <Stack.Screen options={{ headerTitle: () => <Header navigation = {navigation}  /> }}
        name="Home" component={Home} />
      <Stack.Screen name="SecondHome" component={SecondHome} />
    </Stack.Navigator>
  );
}

export default HomeStack;