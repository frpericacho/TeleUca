import { NavigationContainer } from '@react-navigation/native';
import React,{ useContext } from 'react';
import { AuthContext } from '../lib/AuthProvider';
import AuthStack from './AuthStack';
import MainStack from './MainStack';

export default () => {
	const auth = useContext(AuthContext);
	const user = auth.user;
	return (
		<NavigationContainer>
			{user == false && <AuthStack />}
			{user == true && <MainStack />}
		</NavigationContainer>
	);
};