import React, { useState } from "react";
import { View, FlatList, TouchableOpacity } from "react-native";
import { Searchbar } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import firebase from "firebase";
import Chat from "../lib/Types/Chat";
import ChatItem from "../components/chatItem";
import User from "../lib/Types/User";
import UserItem from "../components/userItem";

export default function Search({ navigation }: any) {
  //MyUser
  const MyUserAuth = firebase.auth().currentUser;
  //SearchBar
  const [search, setState] = useState("");
  //Chat
  const [chats, setChats] = useState<Array<Chat>>([]);
  //User
  const [users, setUsers] = useState<Array<User>>([]);

  const updateSearch = (searchTerm: string) => {
    setState(searchTerm);
    if (!searchTerm) {
      setChats([]);
      setUsers([]);
    } else {
      let docs: any = [];
      let userDocs: any = [];
      firebase
        .firestore()
        .collection("chats")
        .orderBy("titleLowerCase")
        .startAt(searchTerm.toLowerCase())
        .endAt(searchTerm.toLowerCase() + "\uf8ff")
        .onSnapshot((snapshot) => {
          docs = snapshot.docs
            .filter((doc) => {
              return doc.data().users.UserList.includes(MyUserAuth?.email);
            })
            .map((doc) => {
              return { id: doc.id, ...doc.data() };
            });
          setChats(docs);
        });
      firebase
        .firestore()
        .collection("users")
        .orderBy("email")
        .startAt(searchTerm)
        .endAt(searchTerm + "\uf8ff")
        .onSnapshot((snapshot) => {
          userDocs = snapshot.docs
            .filter((doc) => {
              return doc.data().email != MyUserAuth?.email;
            })
            .map((doc) => {
              return { id: doc.id, ...doc.data() };
            });
          setUsers(userDocs);
        });
    }
  };

  const renderUserItem = ({ item }: any) => (
    <UserItem navigation={navigation} User={item} Search={true} />
  );

  const renderChatItem = ({ item }: any) => (
    <ChatItem navigation={navigation} Chat={item} Search={true} />
  );

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          display: "flex",
          width: "100%",
          marginTop: 5,
        }}
      >
        <View
          style={{
            display: "flex",
            justifyContent: "center",
            alignContent: "center",
          }}
        >
          <View style={{ marginLeft: 15, marginRight: 15 }}>
            <TouchableOpacity>
              <Icon
                name="arrow-left"
                size={30}
                color="#900"
                onPress={() => navigation.goBack()}
              />
            </TouchableOpacity>
          </View>
        </View>
        <Searchbar
          style={{ width: "100%" }}
          inputStyle={{ width: "100%" }}
          placeholder="Search"
          onChangeText={updateSearch}
          value={search}
          autoCapitalize={"none"}
        />
      </View>
      <View style={{ marginTop: 10 }}>
        <FlatList
          style={{ marginBottom: 1 }}
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.title}
        />
      </View>
      <View style={{ marginTop: 10 }}>
        <FlatList
          style={{ marginBottom: 1 }}
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.email}
        />
      </View>
    </View>
  );
}
