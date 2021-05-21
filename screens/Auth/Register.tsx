import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Input } from "react-native-elements";
import { supabase } from "../../lib/SupabaseSetUp"
import React from 'react';

export default function Register() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState('')

    const handleRegister = async (email: string, password: string) => {
      setLoading('Registrando')
      const { error, user } =
          await supabase.auth.signUp({ email, password })
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
        <View style={styles.verticallySpaced}>
          <Button
            title="Sign up"
            disabled={!!loading.length}
            loading={loading === 'SIGNUP'}
            onPress={() => handleRegister(email, password)}
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