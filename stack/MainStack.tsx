import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import {DrawerContent} from '../screens/Drawer'
import HomeStack from "./HomeStack";

const Drawer = createDrawerNavigator();

const MainStack = () => {
    return (
      <Drawer.Navigator drawerContent={props => <DrawerContent {...props}/>}>
        <Drawer.Screen name="HomeStack" component={HomeStack} />
      </Drawer.Navigator>
    );
}

export default MainStack;