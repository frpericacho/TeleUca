import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Input, Image, Icon } from "react-native-elements";
import firebase from "firebase";
import React from 'react';

export default function Register({navigation}:any) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState('')

    const handleRegister = async (email: string, password: string) => {
      setLoading('Registrando')
      //  Supabase
      /*
      const { error, user } =
          await supabase.auth.signUp({ email, password })
      if (!error && !user) Alert.alert('Check your email for the login link!')
      if (error) Alert.alert(error.message)
      */

      //  Firebase
      await firebase.auth().createUserWithEmailAndPassword(email,password).then((res)=>{
        console.log(res)
      }).catch((error)=>{
        console.log(error)
      })
      setLoading('')
    }
  
    return (
      <View>
        <View style={{display: "flex", justifyContent: "flex-start", marginLeft:10,marginTop:10}}>
          <Icon
            reverse
            name='arrow-left'
            type='font-awesome'
            color='#005A6D'
            onPress={() => navigation.navigate('Login')}
          />
        </View>
        <View style={{ display:"flex", justifyContent:"center", width: '100%', height: 150}}>
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
        <View >
          <Button
            title="Registrame!"
            disabled={!!loading.length}
            loading={loading === 'SIGNUP'}
            buttonStyle={[styles.Button]}
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