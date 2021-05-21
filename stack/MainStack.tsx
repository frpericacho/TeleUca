import Home from "../screens/Home";
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import SecondHome from "../screens/SecondHome";

const Stack = createStackNavigator();

const MainStack = () => {
    return (
      <Stack.Navigator>
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="SecondHome" component={SecondHome} />
      </Stack.Navigator>
    );
}

export default MainStack;