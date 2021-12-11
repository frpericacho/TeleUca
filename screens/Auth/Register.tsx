import { useState } from "react";
import { Alert, StyleSheet, View, ScrollView } from "react-native";
import { Button, Input, Image, Icon } from "react-native-elements";
import MultiSelect from 'react-native-multiple-select';
import firebase from "firebase";
import React, {useEffect} from "react";

export default function Register({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState("");

  // MultiSelect
  const [selectedSubjects, setSelectedSubjects] = React.useState([]);
  const [subjects, setSubjects] = React.useState([]);

  const [selectedCareer, setSelectedCareer] = React.useState([]);
  const [careers, setCareer] = React.useState([]);

  const [selected, setSelected] = useState(false);

  useEffect(() => {
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    await firebase
      .firestore()
      .collection("careers")
      .get().then((snapshot)=>{
        snapshot.docs.forEach((element)=>{
          let career = {
            id: element.id,
            name: element.data().name
          }
          careers.push(career)
        })
      })
  }

  const fetchSubjects = async (selectedItem) => {
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
            subjects.push(subject)
          })
        });
      })
  }

  const handleRegister = async (email: string, password: string) => {
    setLoading("Registrando")
    if (email.includes("@alum.uca.es") || email.includes("@uca.es")) {
      if(!selected){
        console.log("email", email)
        Alert.alert("Selecciona primero una Titulación");
        setLoading("")
      }else{
        await firebase
          .auth()
          .createUserWithEmailAndPassword(email, password)
          .then((res) => {
            console.log(res);
            firebase
              .firestore()
              .collection("users")
              .add({
                email: email,
                avatar_url: "",
                token: "",
                career: selectedCareer[0],
                subjects: selectedSubjects
              })
              .then(() => {
                console.log("Usuario guardado correctamente");
              })
              .catch((error) => {
                console.log(error);
              });
          })
          .catch((error) => {
            switch(error.code){
              case 'auth/email-already-in-use':
                Alert.alert("Este email se encuentra ya en uso");
                setEmail("")
                setPassword("")
                break;
              default:
                Alert.alert("Se ha producido un error en el email y/o contraseña");
                setEmail("")
                setPassword("")
                break;
            }
            console.log(error.code);
          });
        setLoading("");
      }
    } else {
      console.log("email", email)
      Alert.alert("Correo fuera del domino de la UCA");
      setEmail("")
      setPassword("")
      setLoading("")
    }
  };

  return (
    <View>
      <ScrollView>
        <View
          style={{
            display: "flex",
            justifyContent: "flex-start",
            marginLeft: 10,
            marginTop: 10,
          }}
        >
          <Icon
            reverse
            name="arrow-left"
            type="font-awesome"
            color="#005A6D"
            onPress={() => navigation.navigate("Login")}
          />
        </View>
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            height: 150,
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
        <View style={styles.ListCareer}>
          <MultiSelect
            items={careers}
            selectedItems={selectedCareer}
            onSelectedItemsChange={(selectedItems)=>{setSelectedCareer(selectedItems); setSelected(true); fetchSubjects(selectedItems[0])}}
            selectText="Escoge titulación"
            searchInputPlaceholderText="Buscar titulaciones..."
            noItemsText="No se encuentran coincidencias"
            styleTextDropdown={{marginLeft:10}}
            styleTextDropdownSelected={{marginLeft:10}}
            searchInputStyle={{height:40}}
            hideDropdown
            single
            textInputProps={{autoFocus:false}}
            displayKey="name"
            uniqueKey="name"
          />
        </View>
        {selected ? 
        <View style={styles.List}>
          <MultiSelect
            items={subjects}
            selectedItems={selectedSubjects}
            onSelectedItemsChange={(selectedItems)=>setSelectedSubjects(selectedItems)}
            selectText="Escoge asignaturas"
            searchInputPlaceholderText="Buscar asignaturas..."
            noItemsText="No se encuentran coincidencias"
            submitButtonText="Añadir asignaturas"
            hideSubmitButton
            styleTextDropdown={{marginLeft:10}}
            styleTextDropdownSelected={{marginLeft:10}}
            searchInputStyle={{height:40}}
            tagContainerStyle={{
              maxWidth: '90%'
            }}
            hideDropdown
            textInputProps={{autoFocus:false}}
            displayKey="name"
            uniqueKey="id"
          />
        </View>
        : null }
        <View>
          <Button
            title="Registrame!"
            disabled={!!loading.length}
            loading={loading === "SIGNUP"}
            buttonStyle={[styles.Button]}
            onPress={() => handleRegister(email, password)}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    padding: 4,
  },
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
    marginTop: 30,
    marginBottom: 30,
  },
  List:{
    marginHorizontal: 40,
  },
  ListCareer: {
    marginHorizontal: 40,
    marginBottom: 30
  }
});
