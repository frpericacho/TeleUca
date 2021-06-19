import React, { createContext, useState, useEffect } from 'react';
import { supabase } from './SupabaseSetUp';
import { Session } from '@supabase/supabase-js';
import User from './Types/User';
type ContextProps = {
	user: null | boolean;
	session: Session | null;
};

let MyUser: User;

const AuthContext = createContext<Partial<ContextProps>>({});

interface Props {
	children: React.ReactNode;
}

const AuthProvider = (props: Props) => {
	// user null = loading
	const [user, setUser] = useState<null | boolean>(null);
	const [session, setSession] = useState<Session | null>(null);

	useEffect(() => {
		const session = supabase.auth.session();
		setSession(session);
		setUser(session ? true : false);
		const { data: authListener } = supabase.auth.onAuthStateChange(
			async (event, session) => {
				console.log(`Supabase auth event: ${event}`);
				setSession(session);
				setUser(session ? true : false);
			}
		);
		getUser();
		return () => {
			authListener!.unsubscribe();
		};
	}, [user]);

	const getUser = async () => {
		const { data, error } = await supabase
		.from('users')
		.select('*')
		.eq('id', supabase.auth.user()?.id)

		MyUser = {
			id: data[0].id,
			username: data[0].username,
			avatar_url: data[0].avatar_url,
			status: data[0].status
		}
		console.log('MyUser',MyUser)
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				session,
			}}
		>
			{props.children}
		</AuthContext.Provider>
	);
};

export { AuthContext, AuthProvider, MyUser };