import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import AuthStack from './AuthStack';
import MainStack from './MainStack';
import firebase from 'firebase';

export default () => {
	const [auth] = useAuthState(firebase.auth())
	
	return (
		<NavigationContainer>
			{auth ? <MainStack/> : <AuthStack />}
		</NavigationContainer>
	);
};

