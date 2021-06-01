import Home from "../screens/Home";
import React from 'react';
import SecondHome from "../screens/SecondHome";
import { createDrawerNavigator } from '@react-navigation/drawer';
import {DrawerContent} from '../screens/Drawer'

const Drawer = createDrawerNavigator();

const MainStack = () => {
    return (
      <Drawer.Navigator drawerContent={props => <DrawerContent {...props}/>}>
        <Drawer.Screen name="Home" component={Home} />
        <Drawer.Screen name="SecondHome" component={SecondHome} />
      </Drawer.Navigator>
    );
}

export default MainStack;