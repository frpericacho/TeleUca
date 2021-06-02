import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import Home from '../screens/Home';
import SecondHome from '../screens/SecondHome';
import { Header } from '../components/header';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Stack = createStackNavigator();

const HomeStack = ({navigation}) => {
 
    return (
      <Stack.Navigator screenOptions={{headerShown: true}}>
        <Stack.Screen options={{
            //Mover headerLeft y headerRight a <Header /> para poder crear el searchBar 
            headerTitle: props => <Header {... navigation} />,
        }}
        name="Home" component={Home} />
        <Stack.Screen name="SecondHome" component={SecondHome} />
      </Stack.Navigator>
    );
}

export default HomeStack;