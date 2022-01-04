import React from "react";
import { TouchableOpacity, Text, View, StyleSheet } from "react-native";
import { Title } from "react-native-paper";
import { Badge, Avatar, Icon } from "react-native-elements";
import firebase from "firebase";

const ChatItem = ({ Chat, navigation, Search }: any) => {
  //MyUser
  const MyUserAuth = firebase.auth().currentUser;

  const chatTextView = (individual: boolean, searchView: boolean, titleDisplay: string) => {
    if(!searchView){
      if(individual){
        return(
          <View
            style={styles.innerWrapper}
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
        )
      }else{
        return(
          <View
            style={styles.innerWrapper}
          >
            <Title numberOfLines={1} style={styles.title}>
              {Chat.title}
            </Title>
            {Chat.LastMessage.user ? (
              <Text numberOfLines={1} style={styles.subTitle}>{Chat?.LastMessage?.text}</Text>
            ) : (
              <Title adjustsFontSizeToFit style={styles.subTitle}> </Title>
            )}
          </View>
        )
      }
    }else{
      if(individual){
        return(
          <View
            style={styles.innerWrapper}
          >
            <Title adjustsFontSizeToFit style={styles.title}>
              {titleDisplay[0].split("@")[0]}
            </Title>
            <Title adjustsFontSizeToFit style={styles.subTitle}>
              {Chat.description}
            </Title>
          </View>
        )
      }else{
        return(
          <View
            style={styles.innerWrapper}
          >
            <Title numberOfLines={1} style={styles.title}>
              {Chat.title}
            </Title>
            <Title adjustsFontSizeToFit style={styles.subTitle}>
              {Chat.description}
            </Title>
          </View>
        )
      }
    }
  }

  const chatItemView = (individual: boolean, newMessage: boolean, searchView: boolean) => {
    let avatarDisplay, titleDisplay
    if(individual){
      titleDisplay = Chat.users.UserList.filter((email: string) => {
        return email != MyUserAuth?.email;
      });
      avatarDisplay = Chat.avatar_url.filter((user:any)=>{
        return user.email == titleDisplay;
      })
    }
    
    return (
      <TouchableOpacity
        onPress={() => {
          navigation.navigate("Chat", Chat);
        }}
      >
        <View
          style={styles.wrapperItem}
        >
          <View style={{ flexDirection: "column" }}>
            {individual ?
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
            :
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
            }
            {Chat.type == 'difusion' ?
              <Badge
                badgeStyle={{ width: 20, height: 20, backgroundColor:"#B3E5FC" }}
                containerStyle={{ position: "absolute", top: 1, right: 1 }}
                value={<Icon color="#01579B" size={15} name="campaign" type="material"/>}
              />
              :
              null
            }
          </View>
          {chatTextView(individual, searchView, titleDisplay)}
          {newMessage ? 
            <Badge
              status="success"
              badgeStyle={{ width: 25, height: 25 }}
              containerStyle={{ position: "absolute", top: 10, right: 10 }}
              value="!"
            />
          :
            null
          }
        </View>
      </TouchableOpacity>
    );
  }

  if(!Search){
    if (Chat.type == "group" || Chat.type == "difusion") {
      return(
        chatItemView(false, checkNewMessages(Chat, MyUserAuth), false)
      )
    }else{
      return(
        chatItemView(true, checkNewMessages(Chat, MyUserAuth), false)
      )
    }
  }else{
    if (Chat.type == "group" || Chat.type == "difusion") {
      return(
        chatItemView(false, checkNewMessages(Chat, MyUserAuth), true)
      )
    }else{
      return(
        chatItemView(true, checkNewMessages(Chat, MyUserAuth), true)
      )
    }
  }
};
export default ChatItem;

function search(MyEmail: string | null | undefined, myArray: Array<any>) {
  for(let userSearch of myArray){
    if(userSearch.email === MyEmail){
      return userSearch;
    }
  }
}

function checkNewMessages(Chat: any, MyUserAuth: firebase.User | null) {
  let check: boolean;

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
  wrapperItem: {
    flexDirection: "row",
    backgroundColor: "#81D4FA",
    height: 75,
    width: "100%",
    alignItems: "center",
    marginBottom: 1,
  },
  innerWrapper: {
    marginLeft: 15,
    flexDirection: "column",
    width: "60%",
  }
});
