import Home from "../screens/Home";
import React from 'react';
import SecondHome from "../screens/SecondHome";
import { createDrawerNavigator } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

const MainStack = () => {
    return (
      <Drawer.Navigator>
        <Drawer.Screen name="Home" component={Home} />
        <Drawer.Screen name="SecondHome" component={SecondHome} />
      </Drawer.Navigator>
    );
}

export default MainStack;