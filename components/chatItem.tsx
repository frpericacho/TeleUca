import React, { useState } from "react";
import { TouchableOpacity, Text } from "react-native";
import { View, StyleSheet } from "react-native";
import { Title } from "react-native-paper";
import { Badge, Avatar } from "react-native-elements";
import firebase from "firebase";

const ChatItem = ({ Chat, navigation, Search }: any) => {
  //MyUser
  const MyUserAuth = firebase.auth().currentUser;
  if (!Search) {
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
              </View>
              <View
                style={{
                  marginLeft: 15,
                  flexDirection: "column",
                  width: "60%",
                }}
              >
                <Title adjustsFontSizeToFit style={styles.title}>
                  {Chat.title}
                </Title>
                {Chat.LastMessage.user ? (
                  <Text numberOfLines={1} style={styles.subTitle}>{Chat?.LastMessage?.text}</Text>
                ) : (
                  <Title adjustsFontSizeToFit style={styles.subTitle}> </Title>
                )}
              </View>
              <Badge
                status="success"
                badgeStyle={{ width: 25, height: 25 }}
                containerStyle={{ position: "absolute", top: 10, right: 10 }}
                value="!"
              />
            </View>
          </TouchableOpacity>
        );
      } else {

        let titleDisplay = Chat.users.UserList.filter((email: string) => {
          return email != MyUserAuth?.email;
        });
        let avatarDisplay = Chat.avatar_url.filter((user:any)=>{
          return user.email == titleDisplay;
        })
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
                    avatarDisplay[0].avatar_url!=""
                      ? { uri: avatarDisplay[0].avatar_url }
                      : require("../assets/user.png")
                  }
                  size="medium"
                  imageProps={{ resizeMode: "cover" }}
                  rounded
                  containerStyle={{ marginLeft: 20 }}
                />
              </View>
              <View
                style={{
                  marginLeft: 15,
                  flexDirection: "column",
                  width: "60%",
                }}
              >
                <Title adjustsFontSizeToFit style={styles.title}>
                  {titleDisplay[0].split("@")[0]}
                </Title>
                {Chat.LastMessage.user ? (
                  <Text numberOfLines={1} style={styles.subTitle}>{Chat?.LastMessage?.text}</Text>
                ) : (
                  <Title adjustsFontSizeToFit style={styles.subTitle}>
                    {" "}
                  </Title>
                )}
              </View>
              <Badge
                status="success"
                badgeStyle={{ width: 25, height: 25 }}
                containerStyle={{ position: "absolute", top: 10, right: 10 }}
                value="!"
              />
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
                style={{
                  marginLeft: 15,
                  flexDirection: "column",
                  width: "60%",
                }}
              >
                <Title adjustsFontSizeToFit style={styles.title}>
                  {Chat.title}
                </Title>
                {Chat.LastMessage.user ? (
                  <Text numberOfLines={1} style={styles.subTitle}>
                    {Chat?.LastMessage?.user.name.split("@")[0]}:{" "}
                    {Chat?.LastMessage?.text}
                  </Text>
                ) : (
                  <Title adjustsFontSizeToFit style={styles.subTitle}> </Title>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      } else {

        let titleDisplay = Chat.users.UserList.filter((email: string) => {
          return email != MyUserAuth?.email;
        });
        let avatarDisplay = Chat.avatar_url.filter((user:any)=>{
          return user.email == titleDisplay;
        })
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
                    avatarDisplay[0].avatar_url!=""
                      ? { uri: avatarDisplay[0].avatar_url }
                      : require("../assets/user.png")
                  }
                  size="medium"
                  imageProps={{ resizeMode: "cover" }}
                  rounded
                  containerStyle={{ marginLeft: 20 }}
                />
              </View>
              <View
                style={{
                  marginLeft: 15,
                  flexDirection: "column",
                  width: "60%",
                }}
              >
                <Title adjustsFontSizeToFit style={styles.title}>
                  {titleDisplay[0].split("@")[0]}
                </Title>
                {Chat.LastMessage.user ? (
                  <Text numberOfLines={1} style={styles.subTitle}>{Chat?.LastMessage?.text}</Text>
                ) : (
                  <Title adjustsFontSizeToFit style={styles.subTitle}> </Title>
                )}
              </View>
            </View>
          </TouchableOpacity>
        );
      }
    }
  } else {
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
              </View>
              <View
                style={{
                  marginLeft: 15,
                  flexDirection: "column",
                  width: "60%",
                }}
              >
                <Title adjustsFontSizeToFit style={styles.title}>
                  {Chat.title}
                </Title>
                <Title adjustsFontSizeToFit style={styles.subTitle}>
                  {Chat.description}
                </Title>
              </View>
              <Badge
                status="success"
                badgeStyle={{ width: 25, height: 25 }}
                containerStyle={{ position: "absolute", top: 10, right: 10 }}
                value="!"
              />
            </View>
          </TouchableOpacity>
        );
      } else {

        let titleDisplay = Chat.users.UserList.filter((email: string) => {
          return email != MyUserAuth?.email;
        });
        let avatarDisplay = Chat.avatar_url.filter((user:any)=>{
          return user.email == titleDisplay;
        })
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
                    avatarDisplay[0].avatar_url!=""
                      ? { uri: avatarDisplay[0].avatar_url }
                      : require("../assets/user.png")
                  }
                  size="medium"
                  imageProps={{ resizeMode: "cover" }}
                  rounded
                  containerStyle={{ marginLeft: 20 }}
                />
              </View>
              <View
                style={{
                  marginLeft: 15,
                  flexDirection: "column",
                  width: "60%",
                }}
              >
                <Title adjustsFontSizeToFit style={styles.title}>
                  {titleDisplay[0].split("@")[0]}
                </Title>
                <Title adjustsFontSizeToFit style={styles.subTitle}>
                  {Chat.description}
                </Title>
              </View>
              <Badge
                status="success"
                badgeStyle={{ width: 25, height: 25 }}
                containerStyle={{ position: "absolute", top: 10, right: 10 }}
                value="!"
              />
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
                style={{
                  marginLeft: 15,
                  flexDirection: "column",
                  width: "60%",
                }}
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
        let avatarDisplay = Chat.avatar_url.filter((user:any)=>{
          return user.email == titleDisplay;
        })
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
                    avatarDisplay[0].avatar_url!=""
                      ? { uri: avatarDisplay[0].avatar_url }
                      : require("../assets/user.png")
                  }
                  size="medium"
                  imageProps={{ resizeMode: "cover" }}
                  rounded
                  containerStyle={{ marginLeft: 20 }}
                />
              </View>
              <View
                style={{
                  marginLeft: 15,
                  flexDirection: "column",
                  width: "60%",
                }}
              >
                <Title adjustsFontSizeToFit style={styles.title}>
                  {titleDisplay[0].split("@")[0]}
                </Title>
                <Title adjustsFontSizeToFit style={styles.subTitle}>
                  {Chat.description}
                </Title>
              </View>
            </View>
          </TouchableOpacity>
        );
      }
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
