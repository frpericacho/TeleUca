import React, { useLayoutEffect, useState } from "react";
import { Avatar } from "react-native-elements";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Title, Drawer } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import firebase from "firebase";

export function DrawerContent({ props, navigation }: any) {
  const [MyUser, setMyUser] = useState<any>();

  useLayoutEffect(() => {
    fetchMyUser();
  }, []);

  const fetchMyUser = async () => {
    firebase
      .firestore()
      .collection("users")
      .where("email", "==", firebase.auth().currentUser?.email)
      .onSnapshot((snapshot) => {
        setMyUser({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      });
  };

  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props}>
        <TouchableOpacity
          onPress={() => {
            navigation.closeDrawer();
            navigation.navigate("Home");
          }}
          style={{ margin: 20 }}
        >
          <Icon name="home" color="grey" size={30} />
        </TouchableOpacity>
        <View style={{ flexDirection: "row", marginTop: 15 }}>
          <Avatar
            source={
              MyUser?.avatar_url
                ? { uri: MyUser?.avatar_url }
                : require("../assets/user.png")
            }
            size="medium"
            imageProps={{ resizeMode: "cover" }}
            rounded
            containerStyle={{ marginLeft: 20 }}
          />
          <View style={{ marginLeft: 15, flexDirection: "column" }}>
            <Title style={styles.title}>{MyUser?.email.split("@")[0]}</Title>
          </View>
        </View>
        <TouchableOpacity
          onPress={async () =>
            await navigation.navigate("UserProfileEdit", { User: MyUser })
          }
          style={{ marginLeft: 30, marginTop: 20 }}
        >
          <View style={{ flex: 2, flexDirection: "row", alignItems: "center" }}>
            <Icon name="cog" color="grey" size={30} />
            <Title style={{ marginLeft: 15, fontSize: 16 }}>
              Editar mi perfil
            </Title>
          </View>
        </TouchableOpacity>
      </DrawerContentScrollView>
      <Drawer.Section style={styles.bottomDrawerSection}>
        <DrawerItem
          label="Cerrar sesion"
          labelStyle={{ color: "white", fontWeight: "bold" }}
          icon={({ size }) => (
            <Icon name="exit-to-app" color="white" size={size} />
          )}
          onPress={() => firebase.auth().signOut()}
        />
      </Drawer.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
  },
  userInfoSection: {
    paddingLeft: 20,
  },
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: "bold",
  },
  caption: {
    fontSize: 14,
    lineHeight: 14,
  },
  row: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 15,
  },
  paragraph: {
    fontWeight: "bold",
    marginRight: 3,
  },
  drawerSection: {
    marginTop: 15,
  },
  bottomDrawerSection: {
    backgroundColor: "red",
  },
  preference: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});
