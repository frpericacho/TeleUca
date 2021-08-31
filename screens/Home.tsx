import { Text, View, FlatList, Platform, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import ChatItem from "../components/chatItem";
import { useEffect } from "react";
import {
  Modal,
  Portal,
  Button,
  Provider,
  FAB,
  Snackbar,
} from "react-native-paper";
import { Input, SpeedDial } from "react-native-elements";
import Chat from "../lib/Types/Chat";
import * as ImagePicker from "expo-image-picker";
import firebase from "firebase";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Alert } from "react-native";

export default function Home({ navigation }: any) {
  //MyUser
  const MyUserAuth = firebase.auth().currentUser;

  //Chat
  const [chats, setChats] = useState<Array<Chat>>([]);
  const [user, setUser] = useState("");
  const [UserList, setUserList] = useState<Array<any>>([]);
  let textInput: any;

  //Modal
  const [visible, setVisible] = useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: "white", padding: 20 };
  const [open, setOpen] = useState(false);
  const onOpenSnackBar = () => setOpen(!open);
  const onDismissSnackBar = () => setOpen(false);

  //InputModal
  const [titleChat, setTitleChat] = useState("");
  const [DescriptionChat, setDescriptionChat] = useState("");

  const Saved = {
    id: MyUserAuth?.email,
    title: "Mensajes guardados",
    group: true,
    users: {
      UserList: MyUserAuth?.email,
    },
    description: "",
    avatar_url:
      "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT1E5SKljnQvLKVwFk1dcOTKNBVGvbyDNl_qA&usqp=CAU",
    LastMessage: {},
    NewMessages: [
      {
        email: MyUserAuth?.email,
        NewMessage: false,
      },
    ],
  };

  const Item = ({ item }: any) => (
    <ChatItem navigation={navigation} Chat={item} Search={false} />
  );

  useEffect(() => {
    fetchChat();
    retrieveUser();
    (async () => {
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          alert("Sorry, we need camera roll permissions to make this work!");
        }
      }
    })();
  }, []);

  const retrieveUser = async () => {
    UserList.push(MyUserAuth?.email);
  };

  const fetchChat = async () => {
    let docs: any = [];
    firebase
      .firestore()
      .collection("chats")
      .where("users.UserList", "array-contains", MyUserAuth?.email)
      .onSnapshot((snapshot) => {
        docs = snapshot.docs.map((doc) => {
          return { id: doc.id, ...doc.data() };
        });
        setChats(docs);
      });
  };

  const renderChatItem = ({ item }: any) => <Item item={item} />;

  const deleteItem = async (item: any) => {
    let arr = UserList.filter(function (it) {
      return it !== item;
    });
    setUserList(arr);
  };

  const renderUserItem = ({ item }: any) => {
    if (item == MyUserAuth?.email) {
      return null;
    } else {
      return (
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text>{item}</Text>
          <TouchableOpacity onPress={() => deleteItem(item)}>
            <Icon
              name="delete"
              style={{ paddingLeft: 10, paddingRight: 10 }}
              size={20}
              color="red"
            />
          </TouchableOpacity>
        </View>
      );
    }
  };

  const submit = async (title: string, description: string) => {
    if (title == "") {
      onOpenSnackBar();
    } else {
      firebase
        .firestore()
        .collection("chats")
        .add({
          avatar_url: "",
          description: DescriptionChat,
          title: titleChat,
          titleLowerCase: titleChat.toLowerCase(),
          group: true,
          users: {
            UserList,
          },
          LastMessage: {},
          NewMessages: [],
          Admin: MyUserAuth?.email,
        })
        .then(async(chat) => {
          let NewMessages: any = [];
          UserList.forEach((user: string) => {
            NewMessages.push({
              email: user,
              NewMessage: false,
            });
          });
          chat.update({
            NewMessages: NewMessages,
          });
          setUserList([firebase.auth().currentUser?.email]);
          hideModal();

          await setTitleChat('')
          await setDescriptionChat('')
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  const addUserChat = async () => {
    if (MyUserAuth?.email?.includes("@alum.uca.es")) {
      if (user.includes("@uca.es")) {
        Alert.alert("No puedes incluir a un profesor");
        textInput.clear();
        await setUser('')
      } else {
        if(user != ""){
          if(UserList.includes(user)){
            Alert.alert("Este usuario ya está añadido al chat");
            textInput.clear();
            await setUser('')
          }else{
            setUserList([...UserList, user]);
            textInput.clear();
            await setUser('')
          }
        }
      }
    } else {
      if(user != ""){
        if(UserList.includes(user)){
          Alert.alert("Este usuario ya está añadido al chat");
          textInput.clear();
          await setUser('')
        }else{
          setUserList([...UserList, user]);
          textInput.clear();
          await setUser('')
        }
      }
    }
  };

  return (
    <Provider>
      <Portal>
        <Modal
          visible={visible}
          onDismiss={hideModal}
          contentContainerStyle={containerStyle}
        >
          <Text>Añadir Chat</Text>
          <Input
            label="Titulo:"
            onChangeText={(value) => setTitleChat(value)}
            placeholder="Titulo"
          />
          <Input
            label="Descripcion:"
            onChangeText={(value) => setDescriptionChat(value)}
            placeholder="Descripcion"
          />
          <Input
            label="Añadir usuario:"
            ref={(input) => {
              textInput = input;
            }}
            onChangeText={(value) => setUser(value)}
            placeholder="email usuario"
            clearTextOnFocus
            autoCapitalize={"none"}
            rightIcon={
              <TouchableOpacity onPress={addUserChat}>
                <Icon name="account-plus" size={20} color="#03A9F4" />
              </TouchableOpacity>
            }
          />
          <FlatList
            style={{ marginBottom: 3 }}
            data={UserList}
            renderItem={renderUserItem}
            keyExtractor={(item) => item}
          />
          <Button onPress={() => submit(titleChat, DescriptionChat)}>
            Enviar
          </Button>
        </Modal>
        <Snackbar duration={1000} visible={open} onDismiss={onDismissSnackBar}>
          El chat requiere un título
        </Snackbar>
      </Portal>
      <View>
        <ChatItem navigation={navigation} Chat={Saved} Search={false} />
        <FlatList
          style={{ marginBottom: 1 }}
          data={chats.sort((a, b) => sortChat(a, b))}
          renderItem={renderChatItem}
        />
      </View>
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
        icon="chat-plus"
        onPress={showModal}
      />
    </Provider>
  );
}

function sortChat(a: Chat, b: Chat) {
  return a.LastMessage.createdAt < b.LastMessage.createdAt;
}
