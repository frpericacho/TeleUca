import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Input, Image } from "react-native-elements";
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
        <View style={{ display:"flex", justifyContent:"center", width: '100%', height: 200}}>
          <Image
            source={require( '../../assets/logoo.png')}
            style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
          />
        </View>
        <View style={[styles.verticallySpaced, { marginTop: 20, borderBottomWidth:0 }]}>
          <Input style={[styles.Input]}
            label="Correo"
            onChangeText={(text) => setEmail(text)}
            value={email}
            labelStyle={{color: "black", marginHorizontal: 30, marginBottom: 10}}
            inputContainerStyle={{borderBottomWidth:0}}
            placeholder="nombre.apellidos@alum.uca.es"
            autoCapitalize={'none'}
          />
        </View>
        <View style={styles.verticallySpaced}>
          <Input style={[styles.Input]}
            label="Contraseña"
            onChangeText={(text) => setPassword(text)}
            value={password}
            secureTextEntry={true}
            labelStyle={{color: "black", marginHorizontal: 30, marginBottom: 10}}
            inputContainerStyle={{borderBottomWidth:0}}
            placeholder="Contraseña"
            autoCapitalize={'none'}
          />
        </View>
        <View style={[styles.verticallySpaced, { marginTop: 20 }]}>
          <Button
            title="Entrar"
            buttonStyle={[styles.Button]}
            disabled={!!loading.length}
            loading={loading === 'LOGIN'}
            onPress={() => handleLogin(email, password)}
          />
        </View>
        <View>
          <Button
            title="Registro"
            buttonStyle={[styles.Button]}
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>
    )
};


const styles = StyleSheet.create({
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    borderBottomWidth:0,
    alignSelf: 'stretch',
  },
  Input:{
    backgroundColor: "white",
    borderRadius: 25,
    paddingLeft: 20,
    marginHorizontal: 30,
  },
  Button:{
    backgroundColor: "#005A6D",
    marginHorizontal: 30,
    borderRadius: 25
  }
})