import React, { useState } from "react";
import { TouchableOpacity } from "react-native";
import { View, StyleSheet } from "react-native";
import { Title } from "react-native-paper";
import { Badge, Avatar } from "react-native-elements";
import firebase from "firebase";

const ChatItem = ({ Chat, navigation, Search }: any) => {
  //MyUser
  const MyUserAuth = firebase.auth().currentUser;

  if (checkNewMessages(Chat, MyUserAuth)) {
    if (Chat.group) {
      return (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Chat", Chat);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#81D4FA",
              height: 75,
              width: "100%",
              alignItems: "center",
              marginBottom: 1,
            }}
          >
            <View style={{ flexDirection: "column" }}>
              <Avatar
                source={
                  Chat.avatar_url
                    ? { uri: Chat.avatar_url }
                    : require("../assets/user.png")
                }
                size="medium"
                imageProps={{ resizeMode: "cover" }}
                rounded
                containerStyle={{ marginLeft: 20 }}
              />
              <Badge
                status="success"
                containerStyle={{ position: "absolute", top: -4, right: -4 }}
                value="!"
              />
            </View>
            <View
              style={{ marginLeft: 15, flexDirection: "column", width: "60%" }}
            >
              <Title adjustsFontSizeToFit style={styles.title}>
                {Chat.title}
              </Title>
              <Title adjustsFontSizeToFit style={styles.subTitle}>
                {Chat.description}
              </Title>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      let titleDisplay = Chat.users.UserList.filter((email: string) => {
        return email != MyUserAuth?.email;
      });
      return (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Chat", Chat);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#81D4FA",
              height: 75,
              width: "100%",
              alignItems: "center",
              marginBottom: 1,
            }}
          >
            <View style={{ flexDirection: "column" }}>
              <Avatar
                source={
                  Chat.avatar_url
                    ? { uri: Chat.avatar_url }
                    : require("../assets/user.png")
                }
                size="medium"
                imageProps={{ resizeMode: "cover" }}
                rounded
                containerStyle={{ marginLeft: 20 }}
              />
              <Badge
                status="success"
                containerStyle={{ position: "absolute", top: -4, right: -4 }}
                value="!"
              />
            </View>
            <View
              style={{ marginLeft: 15, flexDirection: "column", width: "60%" }}
            >
              <Title adjustsFontSizeToFit style={styles.title}>
                {titleDisplay[0].split("@")[0]}
              </Title>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  } else {
    if (Chat.group) {
      return (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Chat", Chat);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#81D4FA",
              height: 75,
              width: "100%",
              alignItems: "center",
              marginBottom: 1,
            }}
          >
            <View style={{ flexDirection: "column" }}>
              <Avatar
                source={
                  Chat.avatar_url
                    ? { uri: Chat.avatar_url }
                    : require("../assets/user.png")
                }
                size="medium"
                imageProps={{ resizeMode: "cover" }}
                rounded
                containerStyle={{ marginLeft: 20 }}
              />
            </View>
            <View
              style={{ marginLeft: 15, flexDirection: "column", width: "60%" }}
            >
              <Title adjustsFontSizeToFit style={styles.title}>
                {Chat.title}
              </Title>
              <Title adjustsFontSizeToFit style={styles.subTitle}>
                {Chat.description}
              </Title>
            </View>
          </View>
        </TouchableOpacity>
      );
    } else {
      let titleDisplay = Chat.users.UserList.filter((email: string) => {
        return email != MyUserAuth?.email;
      });
      return (
        <TouchableOpacity
          onPress={() => {
            navigation.navigate("Chat", Chat);
          }}
        >
          <View
            style={{
              flexDirection: "row",
              backgroundColor: "#81D4FA",
              height: 75,
              width: "100%",
              alignItems: "center",
              marginBottom: 1,
            }}
          >
            <View style={{ flexDirection: "column" }}>
              <Avatar
                source={
                  Chat.avatar_url
                    ? { uri: Chat.avatar_url }
                    : require("../assets/user.png")
                }
                size="medium"
                imageProps={{ resizeMode: "cover" }}
                rounded
                containerStyle={{ marginLeft: 20 }}
              />
            </View>
            <View
              style={{ marginLeft: 15, flexDirection: "column", width: "60%" }}
            >
              <Title adjustsFontSizeToFit style={styles.title}>
                {titleDisplay[0].split("@")[0]}
              </Title>
            </View>
          </View>
        </TouchableOpacity>
      );
    }
  }
};
export default ChatItem;

function search(MyEmail: string | null | undefined, myArray: Array<any>) {
  for (var i = 0; i < myArray.length; i++) {
    if (myArray[i].email === MyEmail) {
      return myArray[i];
    }
  }
}

function checkNewMessages(Chat: any, MyUserAuth: firebase.User | null) {
  let check: boolean = false;

  if (Chat?.NewMessages) {
    let user = search(MyUserAuth?.email, Chat.NewMessages);
    if (user?.NewMessage) {
      check = true;
    } else {
      check = false;
    }
  }

  return check;
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    marginTop: 3,
    fontWeight: "bold",
  },
  subTitle: {
    fontSize: 12,
  },
});
