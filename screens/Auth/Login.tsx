import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Input } from "react-native-elements";
import { supabase } from "../../lib/SupabaseSetUp"
import React from 'react';

export default function Login({navigation}){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState('')

    const handleLogin = async (email: string, password: string) => {
      setLoading('Entrando')
      const { error, user } =
          await supabase.auth.signIn({ email, password })
      if (!error && !user) Alert.alert('Check your email for the login link!')
      if (error) Alert.alert(error.message)
      setLoading('')
    }
  
    return (
      <View>
        <View style={[styles.verticallySpaced, { marginTop: 20 }]}>
          <Input
            label="Email"
            leftIcon={{ type: 'font-awesome', name: 'envelope' }}
            onChangeText={(text) => setEmail(text)}
            value={email}
            placeholder="email@address.com"
            autoCapitalize={'none'}
          />
        </View>
        <View style={styles.verticallySpaced}>
          <Input
            label="Password"
            leftIcon={{ type: 'font-awesome', name: 'lock' }}
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            placeholder="Password"
            autoCapitalize={'none'}
          />
        </View>
        <View style={[styles.verticallySpaced, { marginTop: 20 }]}>
          <Button
            title="Sign in"
            disabled={!!loading.length}
            loading={loading === 'LOGIN'}
            onPress={() => handleLogin(email, password)}
          />
        </View>
        <View>
          <Button
            title="Registro"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>
    )
};


const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 4,
  },
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    alignSelf: 'stretch',
  },
})