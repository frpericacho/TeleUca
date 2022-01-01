import React, { useState } from "react";
import { StyleSheet, View, Alert } from "react-native";
import { Button, Input, Image } from "react-native-elements";
import firebase from "firebase";
import { registerForPushNotificationsAsync } from "../../App";

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState("");

  const handleLogin = async (email: string, password: string) => {
    setLoading("Entrando")
    await firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then((res) => {
        console.log(res);
        registerForPushNotificationsAsync();
      })
      .catch((error) => {
        console.log('error',error.message)
        switch (error.message) {
          case 'There is no user record corresponding to this identifier. The user may have been deleted.':
            Alert.alert("No se ha encontrado a ningún usuario con esta email");
            setEmail("")
            setPassword("")
            break;
          case 'The password is invalid or the user does not have a password.':
            Alert.alert("Contraseña incorrecta");
            setEmail("")
            setPassword("")
            break;
          case 'A network error (such as timeout, interrupted connection or unreachable host) has occurred.':
            Alert.alert("Error en la red, compruebe que dispone de una conexión de internet");
            break;
          case 'The email address is badly formatted.':
            Alert.alert("Formato de email incorrecto");
            setEmail("")
            setPassword("")
            break;
          default:
            Alert.alert("Se ha producido un error inesperado, inténtelo más tarde");
            setEmail("")
            setPassword("")
        }
      });
    setLoading("")
  };

  return (
    <View>
      <View
        style={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          height: 200,
        }}
      >
        <Image
          source={require("../../assets/logoo.png")}
          style={{ width: "100%", height: "100%", resizeMode: "contain" }}
        />
      </View>
      <View
        style={[
          styles.verticallySpaced,
          { marginTop: 20, borderBottomWidth: 0 },
        ]}
      >
        <Input
          style={[styles.Input]}
          label="Correo"
          onChangeText={(text) => setEmail(text)}
          value={email}
          labelStyle={{
            color: "black",
            marginHorizontal: 30,
            marginBottom: 10,
          }}
          inputContainerStyle={{ borderBottomWidth: 0 }}
          placeholder="nombre.apellidos@alum.uca.es"
          autoCapitalize={"none"}
        />
      </View>
      <View style={styles.verticallySpaced}>
        <Input
          style={[styles.Input]}
          label="Contraseña"
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          labelStyle={{
            color: "black",
            marginHorizontal: 30,
            marginBottom: 10,
          }}
          inputContainerStyle={{ borderBottomWidth: 0 }}
          placeholder="Contraseña"
          autoCapitalize={"none"}
        />
      </View>
      <View style={[styles.verticallySpaced, { marginTop: 20 }]}>
        <Button
          title="Entrar"
          buttonStyle={[styles.Button]}
          disabled={!!loading.length}
          loading={loading === "LOGIN"}
          onPress={() => handleLogin(email, password)}
        />
      </View>
      <View>
        <Button
          title="Registro"
          buttonStyle={[styles.Button]}
          onPress={() => navigation.navigate("Register")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  verticallySpaced: {
    paddingTop: 4,
    paddingBottom: 4,
    borderBottomWidth: 0,
    alignSelf: "stretch",
  },
  Input: {
    backgroundColor: "white",
    borderRadius: 25,
    paddingLeft: 20,
    marginHorizontal: 30,
  },
  Button: {
    backgroundColor: "#005A6D",
    marginHorizontal: 30,
    borderRadius: 25,
  },
});
