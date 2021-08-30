import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Image, Input } from "react-native-elements";
import { FAB, Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import firebase from "firebase";
import { Alert } from "react-native";

const UserProfileEdit = ({ route, navigation }: any) => {
  //Image
  const [ImageUser, setImageUser] = useState(route.params.User.avatar_url);

  //Password
  const [PassBool, setPassBool] = useState(false);
  const [Password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");
  let textInput: TextInput | null;
  let textConfirmInput: TextInput | null;

  const uploadImage = (uri: string) => {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.onerror = reject;
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          resolve(xhr.response);
        }
      };

      xhr.open("GET", uri);
      xhr.responseType = "blob";
      xhr.send();
    });
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      let nombre = route.params.User.email;
      if (result.type == "image") {
        uploadImage(result.uri)
          .then((resolve: any) => {
            let ref = firebase.storage().ref().child(`media/${nombre}`);

            ref.put(resolve).then((resolve) => {
              resolve.ref.getDownloadURL().then((url) => {
                //Modificar tambien los chats individuales

                firebase
                  .firestore()
                  .collection("users")
                  .doc(route.params.User.id)
                  .update({
                    avatar_url: url,
                  })
                  .then(() => {
                    setImageUser(url);
                    changeImageChats();
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              });
            });
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
  };

  const changeImageChats = async () => {
    firebase
      .firestore()
      .collection("chats")
      .where("group", "==", false)
      .where("users.UserList", "array-contains", route.params.User.email)
      .get()
      .then((docs) => {
        docs.forEach((chat) => {
          let MyAvatar = chat.data().avatar_url.filter((user:any)=>{
            return user.email == route.params.User.email;
          })
          let OtherAvatar = chat.data().avatar_url.filter((user:any)=>{
            return user.email != route.params.User.email;
          })
          MyAvatar[0].avatar_url = ImageUser

          let avatar_aux=[...MyAvatar,...OtherAvatar]
          chat.ref.update({avatar_url: avatar_aux})
        });
      });
  };

  const changePassword = async () => {
    if (Password != ConfirmPassword) {
      Alert.alert("Las contraseñas no coinciden");
    } else {
      firebase
        .auth()
        .currentUser?.updatePassword(Password)
        .then(() => {
          Alert.alert("contraseña actualizada correctamente");
          setPassBool(false);
        });
    }
  };

  return (
    <View
      style={{
        flexDirection: "column",
        height: "100%",
        justifyContent: "flex-start",
      }}
    >
      <View
        style={{
          backgroundColor: "white",
          height: "7%",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ marginLeft: 15 }}>
          <TouchableOpacity>
            <Icon
              name="arrow-left"
              size={30}
              color="#900"
              onPress={() => navigation.navigate("Home")}
            />
          </TouchableOpacity>
        </View>
        <View>
          <Text>Perfil</Text>
        </View>
        <View>
          <Icon name="circle-edit-outline" size={30} color="#FFF" />
        </View>
      </View>
      <View style={{ height: "93%", flex: 1, flexDirection: "column" }}>
        <View style={{ flex: 1 }}>
          <Image
            source={
              ImageUser.length != 0
                ? { uri: ImageUser }
                : require("../assets/user.png")
            }
            style={{ height: "100%", resizeMode: "cover" }}
          />
          <FAB
            style={{
              backgroundColor: "#03A9F4",
              position: "absolute",
              margin: 16,
              padding: 5,
              right: 0,
              bottom: 0,
            }}
            small
            color="#FFF"
            icon="image-edit"
            onPress={pickImage}
          />
        </View>
        <View style={{ flex: 2, paddingLeft: 20, backgroundColor: "#B3E5FC" }}>
          <View>
            <Text style={{ fontWeight: "bold", marginTop: 20 }}>Email:</Text>
            <Text style={{ marginTop: 10 }}>{route.params.User.email}</Text>
          </View>
          <View>
            {PassBool ? (
              <View></View>
            ) : (
              <Button
                onPress={() => {
                  if (!PassBool) {
                    setPassBool(true);
                  } else {
                    setPassBool(false);
                  }
                }}
                style={{ marginTop: 20, marginRight: 20 }}
              >
                Cambiar contraseña
              </Button>
            )}
            {PassBool ? (
              <View style={{ marginTop: 20, marginRight: 20 }}>
                <Input
                  secureTextEntry={true}
                  ref={(input) => {
                    textInput = input;
                  }}
                  label="Nueva contraseña"
                  labelStyle={{ fontWeight: "bold", color: "black" }}
                  onChangeText={(value) => setPassword(value)}
                  placeholder="Nueva contraseña"
                  clearTextOnFocus
                />
                <Input
                  secureTextEntry={true}
                  ref={(input) => {
                    textConfirmInput = input;
                  }}
                  label="Confirmar contraseña"
                  labelStyle={{ fontWeight: "bold", color: "black" }}
                  onChangeText={(value) => setConfirmPassword(value)}
                  placeholder="Confirmar contraseña"
                  clearTextOnFocus
                />
                <Button onPress={() => changePassword()}>Enviar</Button>
              </View>
            ) : (
              <View></View>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

export default UserProfileEdit;
