import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Image, Input } from "react-native-elements";
import { FAB, Button } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import firebase from "firebase";
import MultiSelect from 'react-native-multiple-select';

const UserProfileEdit = ({ route, navigation }: any) => {
  //Image
  const [ImageUser, setImageUser] = useState(route.params.User.avatar_url);

  // MultiSelect
  const [selectedSubjects, setSelectedSubjects] = React.useState([]);
  const [subjects, setSubjects] = React.useState([]);

  const [selectedCareer, setSelectedCareer] = React.useState([]);
  const [careers, setCareer] = React.useState([]);

  const [selectedC, setSelectedC] = useState(false);
  const [selectedS, setSelectedS] = useState(false);
  const [showButton, setShowButton] = useState(false);

  //Password
  const [PassBool, setPassBool] = useState(false);
  const [Password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");

  let textInput: TextInput | null;
  let textConfirmInput: TextInput | null;

  useEffect(() => {
    fetchMyUser()
  }, []);

  const fetchMyUser = async () => {
    firebase
      .firestore()
      .collection("users")
      .doc(route.params.User.id)
      .get().then((user)=>{
        selectedCareer.push(user.data().career)
        fetchCareers()
        fetchMysubjects(user.data().subjects, user.data().career)
      })
  }

  const fetchCareers = async () => {
    setCareer([])
    let arrayCareer=[]
    await firebase
      .firestore()
      .collection("careers")
      .get().then((snapshot)=>{
        snapshot.docs.forEach((element)=>{
          let career = {
            id: element.id,
            name: element.data().name
          }
          arrayCareer.push(career)
        })
      })
    setCareer(arrayCareer)
    setSelectedC(true)
  }

  const fetchMysubjects = async (subjects, career) => {
    setSelectedSubjects([])
    let arraySubjects=[]
    await subjects.forEach(async (subject) => {
      await firebase
      .firestore()
      .collection("subjects")
      .doc(subject)
      .get().then((snapshot)=>{
        arraySubjects.push(snapshot.id)
      })
    });
    setSelectedSubjects(arraySubjects)
    fetchSubjects(career)
  }

  const fetchSubjects = async (selectedItem) => {
    setSubjects([])
    let arraySubjects=[]
    await firebase
    .firestore()
    .collection("careers")
    .where("name","==",selectedItem)
    .get().then((snapshot)=>{
      snapshot.docs[0].data().subjects.forEach(element => {
        element.get().then((doc)=>{
          let subject = {
            id: doc.id,
            name: doc.data().name,
            acronym: doc.data().acronym
          }
          arraySubjects.push(subject)
        })
      });
    })
    setSubjects(arraySubjects)
    setSelectedS(true)
  }
  
  const updateSubjects = async () => {
    firebase
      .firestore()
      .collection("users")
      .doc(route.params.User.id)
      .update({
        subjects: selectedSubjects,
        career: selectedCareer[0]
      })
  }

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
    //type: individual
    firebase
      .firestore()
      .collection("chats")
      .where("type", "==", "individual")
      .where("users.UserList", "array-contains", route.params.User.email)
      .get()
      .then((docs) => {
        docs.forEach((chat) => {
          console.log('este es el chat',chat.data())
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
          <ScrollView>
            <View style={{marginHorizontal: 40, marginRight:20}}>
              <Text style={{ fontWeight: "bold", marginTop: 20 }}>Email:</Text>
              <Text style={{ marginTop: 10 }}>{route.params.User.email}</Text>
            </View>
            <View>
              {PassBool ? (
                <View></View>
              ) : (
                <Button
                  contentStyle={{backgroundColor:'#039BE5', marginBottom: 20, marginHorizontal: 40, marginRight:20}}
                  labelStyle={{color:'white'}}
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
                <View style={{ marginTop: 20, marginRight: 60, marginBottom: 20}}>
                  <Input
                    secureTextEntry={true}
                    ref={(input) => {
                      textInput = input;
                    }}
                    containerStyle={{marginLeft:30}}
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
                    containerStyle={{marginLeft:30}}
                    label="Confirmar contraseña"
                    labelStyle={{ fontWeight: "bold", color: "black" }}
                    onChangeText={(value) => setConfirmPassword(value)}
                    placeholder="Confirmar contraseña"
                    clearTextOnFocus
                  />
                  <Button 
                    contentStyle={{backgroundColor:'#039BE5', marginBottom: 20 }}
                    style={{marginLeft: 40, marginRight: -20}}
                    labelStyle={{color:'white'}} onPress={() => changePassword()}>
                      Confirmar contraseña
                  </Button>
                  <Button 
                    contentStyle={{backgroundColor:'#039BE5'}}
                    style={{marginLeft: 40, marginRight: -20}}
                    labelStyle={{color:'white'}} onPress={() => setPassBool(false)}>
                      Cancelar
                  </Button>
                </View>
              ) : (
                <View></View>
              )}
              {selectedC ? 
                <View style={styles.ListCareer}>
                  <MultiSelect
                    items={careers}
                    selectedItems={selectedCareer}
                    onSelectedItemsChange={(selectedItems)=>{setSelectedCareer(selectedItems); setSelectedSubjects([]); fetchSubjects(selectedItems[0])}}
                    selectText="Escoge titulación"
                    searchInputPlaceholderText="Buscar titulaciones..."
                    noItemsText="No se encuentran coincidencias"
                    styleTextDropdown={{marginLeft:10}}
                    styleTextDropdownSelected={{marginLeft:10}}
                    searchInputStyle={{height:40}}
                    styleDropdownMenuSubsection={{borderRadius: 25, height:"100%"}}
                    hideDropdown
                    single
                    textInputProps={{autoFocus:false}}
                    displayKey="name"
                    uniqueKey="name"
                  />
                </View>
              : null}
              {selectedS ? 
                <View style={styles.List}>
                  <ScrollView>
                    <MultiSelect
                      items={subjects}
                      selectedItems={selectedSubjects}
                      onSelectedItemsChange={(selectedItems)=>{setSelectedSubjects(selectedItems); setShowButton(true);}}
                      selectText="Escoge asignaturas"
                      searchInputPlaceholderText="Buscar asignaturas..."
                      noItemsText="No se encuentran coincidencias"
                      submitButtonText="Añadir asignaturas"
                      hideSubmitButton
                      hideDropdown
                      styleTextDropdown={{marginLeft:10}}
                      styleTextDropdownSelected={{marginLeft:10}}
                      searchInputStyle={{height:40}}
                      styleDropdownMenuSubsection={{borderRadius: 25, height:"100%"}}
                      tagContainerStyle={{
                        maxWidth: '90%'
                      }}
                      textInputProps={{autoFocus:false}}
                      displayKey="name"
                      uniqueKey="id"
                    />
                    { showButton ?
                        <Button 
                          contentStyle={{backgroundColor:'#039BE5', marginVertical: 20}}
                          labelStyle={{color:'white'}} onPress={() => updateSubjects()}>
                            Confirmar asignaturas
                        </Button>
                      : null
                    }
                  </ScrollView>
                </View>
              : null}
            </View>

          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  List:{
    marginTop: 30,
    marginHorizontal: 40,
  },
  ListCareer: {
    marginHorizontal: 40
  }
});

export default UserProfileEdit;
