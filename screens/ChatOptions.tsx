import React, { useLayoutEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Image, Input } from "react-native-elements";
import UserItem from "../components/userItem";
import { SwipeListView } from "react-native-swipe-list-view";
import firebase from "firebase";
import { Button, Provider, Portal, Modal, FAB } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { useEffect } from "react";

const ChatOptions = ({ route, navigation }: any) => {
  //MyUser
  const MyUserAuth = firebase.auth().currentUser;

  //User
  const [users, setUsers] = useState<Array<any>>([]);

  //Modal
  const [visible, setVisible] = React.useState(false);
  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const [UserList, setUserList] = useState<Array<any>>([]);
  const [user, setUser] = useState("");
  let textInput: any;

  //ModalTitle
  const [visibleTitle, setVisibleTitle] = React.useState(false);
  const showModalTitle = () => setVisibleTitle(true);
  const hideModalTitle = () => setVisibleTitle(false);
  const [Title, setTitle] = useState(route.params.chat.title);
  const [TitleChat, setTitleChat] = useState(route.params.chat.title);
  let textInputTitle: any;

  //ChatImage
  const [ImageChat, setImageChat] = useState<string>('')

  //DeleteChat
  const [visibleDeleteChat, setDeleteChat] = React.useState(false);
  const showModalDeleteChat = () => setDeleteChat(true);
  const hideModalDeleteChat = () => setDeleteChat(false);

  useEffect(()=>{
    getChatImagen()
  }, []);

  useLayoutEffect(() => {
    fetchUsers(route.params.chat.users.UserList);
  }, []);

  const getChatImagen = async () => {
    //type: individual
    if(route.params.chat.type == "individual"){
      let titleDisplay = route.params.chat.users.UserList.filter((email: string) => {
        return email != MyUserAuth?.email;
      });
      let avatarDisplay = route.params.chat.avatar_url.filter((user:any)=>{
        return user.email == titleDisplay;
      })
      await setImageChat(avatarDisplay[0].avatar_url)
    }else{
      await setImageChat(route.params.chat.avatar_url)
    }
  }

  const fetchUsers = async (UserList: any) => {
    let userDocs: any = [];
    firebase
      .firestore()
      .collection("users")
      .where("email", "in", UserList)
      .get()
      .then((snapshot) => {
        userDocs = snapshot.docs
          .filter((user) => {
            return user.data().email != MyUserAuth?.email;
          })
          .map((user) => {
            return user.data();
          });
        setUsers(userDocs);
      });
  };

  const renderUserItem = ({ item }: any) => (
    <UserItem navigation={navigation} User={item} Search={false} />
  );

  const renderHiddenUserItem = (data: any) => (
    <View style={styles.rowBack}>
      <TouchableOpacity
        style={[styles.backRightBtn, styles.backRightBtnRight]}
        onPress={() => DeleteUserFromChat(data)}
      >
        <Icon name="delete" size={30} color="#FFF" />
      </TouchableOpacity>
    </View>
  );

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
      let nombre = route.params.chat.id;
      if (result.type == "image") {
        uploadImage(result.uri)
          .then((resolve: any) => {
            let ref = firebase.storage().ref().child(`media/${nombre}`);

            ref.put(resolve).then((resolve) => {
              resolve.ref.getDownloadURL().then((url) => {
                firebase
                  .firestore()
                  .collection("chats")
                  .doc(route.params.chat.id)
                  .update({
                    avatar_url: url,
                  })
                  .then(() => {
                    setImageChat(url);
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

  const DeleteUserFromChat = async (data: any) => {
    firebase
      .firestore()
      .collection("chats")
      .doc(route.params.chat?.id)
      .get()
      .then((chat) => {
        let UserListAux = chat.data()?.users.UserList;
        let NewMessagesAux = chat.data()?.NewMessages;
        let usersAux = users.filter((user: any) => {
          return user.email != data.item.email;
        });

        NewMessagesAux = NewMessagesAux.filter((user: any) => {
          return user.email != data.item.email;
        });
        UserListAux = UserListAux.filter((email: string) => {
          return email != data.item.email;
        });

        setUsers(usersAux);

        chat.ref.update({
          NewMessages: NewMessagesAux,
          users: {
            UserList: UserListAux,
          },
        });
      });
  };

  const DeleteMySelfFromChat = async () => {
    firebase
      .firestore()
      .collection("chats")
      .doc(route.params.chat?.id)
      .get()
      .then((chat) => {
        let UserListAux = chat.data()?.users.UserList;
        let NewMessagesAux = chat.data()?.NewMessages;
        let usersAux = users.filter((user: any) => {
          return user.email != MyUserAuth?.email;
        });

        NewMessagesAux = NewMessagesAux.filter((user: any) => {
          return user.email != MyUserAuth?.email;
        });
        UserListAux = UserListAux.filter((email: string) => {
          return email != MyUserAuth?.email;
        });

        setUsers(usersAux);

        chat.ref.update({
          NewMessages: NewMessagesAux,
          users: {
            UserList: UserListAux,
          },
        });
      })
      .then(() => {
        navigation.navigate("Home");
      });
  };

  const deleteItem = async (item: any) => {
    let arr = UserList.filter(function (it) {
      return it !== item;
    });
    setUserList(arr);
  };

  const deleteChat = async () => {
    firebase.firestore().collection("chats").doc(route.params.chat.id).delete();
    navigation.navigate("Home");
  };

  const renderUserItemFlatList = ({ item }: any) => {
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
  };

  const AddUserToChat = async () => {
    firebase
      .firestore()
      .collection("chats")
      .doc(route.params.chat.id)
      .get()
      .then((chat) => {
        let UserListAux = chat.data()?.users.UserList;
        let NewMessagesAux = chat.data()?.NewMessages;

        UserListAux = UserList.filter((email: string) => {
          return !UserListAux.includes(email);
        }).concat(UserListAux);

        UserList.filter((email: string) => {
          let ArrayAux: Array<any> = [];
          ArrayAux = NewMessagesAux.filter((user: any) => {
            return user.email == email;
          });
          if (ArrayAux.length == 0) {
            return true;
          } else {
            return false;
          }
        }).forEach((email: string) => {
          let NewMessage = {
            email: email,
            NewMessage: false,
          };
          NewMessagesAux = NewMessagesAux.concat(NewMessage);
        });

        fetchUsers(UserListAux);

        chat.ref.update({
          NewMessages: NewMessagesAux,
          users: {
            UserList: UserListAux,
          },
        });
      });
  };

  const addUserChat = async () => {
    setUserList([...UserList, user]);
    textInput.clear();
  };

  const ChangeTitleChat = async () => {
    firebase
      .firestore()
      .collection("chats")
      .doc(route.params.chat.id)
      .update({
        title: Title,
      })
      .then((chat) => {
        setTitleChat(Title);
        hideModalTitle();
      });
  };
  //type: group || difusion
  if (route.params.chat.type == "group" || route.params.chat.type == "difusion") {
    if (route.params.Admin) {
      return (
        <Provider>
          <View
            style={{
              flexDirection: "column",
              height: "100%",
              justifyContent: "flex-start",
            }}
          >
            <Portal>
              <Modal
                visible={visible}
                onDismiss={hideModal}
                contentContainerStyle={styles.containerStyle}
              >
                <Input
                  label="Añadir usuario:"
                  ref={(input) => {
                    textInput = input;
                  }}
                  onChangeText={(value) => setUser(value)}
                  placeholder="email usuario"
                  clearTextOnFocus
                  rightIcon={
                    <TouchableOpacity onPress={addUserChat}>
                      <Icon name="account-plus" size={20} color="#03A9F4" />
                    </TouchableOpacity>
                  }
                />
                <FlatList
                  style={{ marginBottom: 3 }}
                  data={UserList}
                  renderItem={renderUserItemFlatList}
                  keyExtractor={(item: any) => item.toString()}
                />
                <Button onPress={() => AddUserToChat()}>Enviar</Button>
              </Modal>
              <Modal
                visible={visibleTitle}
                onDismiss={hideModalTitle}
                contentContainerStyle={styles.containerStyle}
              >
                <Input
                  value={Title}
                  label="Nuevo nombre de chat:"
                  ref={(input) => {
                    textInputTitle = input;
                  }}
                  onChangeText={(value) => setTitle(value)}
                  placeholder="Título chat"
                  clearTextOnFocus
                />
                <Button onPress={() => ChangeTitleChat()}>Enviar</Button>
              </Modal>
              <Modal
                visible={visibleDeleteChat}
                onDismiss={hideModalDeleteChat}
                contentContainerStyle={styles.containerStyle}
              >
                <View>
                  <Text style={{ fontWeight: "bold", fontSize: 20 }}>
                    Seguro que quieres borrar este chat?
                  </Text>
                  <Text
                    style={{
                      fontWeight: "normal",
                      fontSize: 15,
                      marginTop: 10,
                      color: "red",
                    }}
                  >
                    ¡Está acción no se puede deshacer!
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-around",
                      marginTop: 20,
                    }}
                  >
                    <Button
                      labelStyle={{ fontWeight: "bold" }}
                      onPress={hideModalDeleteChat}
                    >
                      Cancelar
                    </Button>
                    <Button
                      labelStyle={{ color: "red", fontWeight: "bold" }}
                      onPress={() => deleteChat()}
                    >
                      Borrar
                    </Button>
                  </View>
                </View>
              </Modal>
            </Portal>
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
                    onPress={() => navigation.push("Chat", route.params.chat)}
                  />
                </TouchableOpacity>
              </View>
              <View>
                <Text>
                {TitleChat.length > 30 ?
                  TitleChat.substring(0, 27).concat("...")
                  :
                  TitleChat
                }
                </Text>
              </View>
              <View style={{ flexDirection: "row" }}>
                <View style={{ marginRight: 15 }}>
                  <Icon
                    name="circle-edit-outline"
                    size={30}
                    color="#900"
                    onPress={showModalTitle}
                  />
                </View>
                <View style={{ marginRight: 15 }}>
                  <Icon
                    name="delete"
                    size={30}
                    color="red"
                    onPress={showModalDeleteChat}
                  />
                </View>
              </View>
            </View>
            <View style={{ height: "93%", flex: 1, flexDirection: "column" }}>
              <View style={{ flex: 1 }}>
                <Image
                  source={
                    ImageChat?.length != 0
                      ? { uri: ImageChat }
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
              <View style={{ flex: 2, backgroundColor: "#B3E5FC" }}>
                <Text style={{ margin: 10, fontSize: 15 }}>
                  {route.params.chat.description}
                </Text>
                <Text style={{ margin: 10, fontWeight: "bold", fontSize: 20 }}>
                  Participantes
                </Text>
                <SwipeListView
                  data={users}
                  renderItem={renderUserItem}
                  keyExtractor={(item: any) => item.email.toString()}
                  renderHiddenItem={(data) => renderHiddenUserItem(data)}
                  rightOpenValue={-75}
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
                  icon="account-plus"
                  onPress={showModal}
                />
              </View>
            </View>
          </View>
        </Provider>
      );
    } else {
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
                  onPress={() => navigation.push("Chat", route.params.chat)}
                />
              </TouchableOpacity>
            </View>
            <View>
              <Text>
                {TitleChat.length > 30 ?
                  TitleChat.substring(0, 27).concat("...")
                  :
                  TitleChat
                }
              </Text>
            </View>
            <View style={{ marginRight: 10 }}>
              <Icon
                name="account-remove"
                size={30}
                color="red"
                onPress={() => DeleteMySelfFromChat()}
              />
            </View>
          </View>
          <View style={{ height: "93%", flex: 1, flexDirection: "column" }}>
            <View style={{ flex: 1 }}>
              <Image
                source={
                  ImageChat?.length != 0
                    ? { uri: ImageChat }
                    : require("../assets/user.png")
                }
                style={{ height: "100%", resizeMode: "cover" }}
              />
            </View>
            <View style={{ flex: 2, backgroundColor: "#B3E5FC" }}>
              <Text style={{ margin: 10, fontSize: 15 }}>
                {route.params.chat.description}
              </Text>
              <Text style={{ margin: 10, fontWeight: "bold", fontSize: 20 }}>
                Participantes
              </Text>
              <FlatList
                style={{ marginBottom: 3 }}
                data={users}
                renderItem={renderUserItem}
                keyExtractor={(item: any) => item.toString()}
              />
            </View>
          </View>
        </View>
      );
    }
  } else {
    // HASTA AQUI
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
                onPress={() => navigation.push("Chat", route.params.chat)}
              />
            </TouchableOpacity>
          </View>
          <View>
            <Text>
              {TitleChat.length > 30 ?
                TitleChat.substring(0, 27).concat("...")
                :
                TitleChat
              }
            </Text>
          </View>
          <View>
            <Icon name="dots-vertical" size={30} color="white" />
          </View>
        </View>
        <View style={{ height: "93%", flex: 1, flexDirection: "column" }}>
          <View style={{ flex: 1 }}>
            <Image
              source={
                ImageChat?.length != 0
                  ? { uri: ImageChat }
                  : require("../assets/user.png")
              }
              style={{ height: "100%", resizeMode: "cover" }}
            />
          </View>
          <View style={{ flex: 2, backgroundColor: "#B3E5FC" }}>
            <View style={{marginTop: 20, marginLeft: 20}}>
              <View>
                <Text style={{fontWeight:'bold', fontSize:18}}>Email:</Text>
              </View>
              <View>
                <Text style={{fontSize:15, marginTop:10}}>{users[0].email}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>
    );
  }
};

export default ChatOptions;

const styles = StyleSheet.create({
  backTextWhite: {
    color: "#FFF",
  },
  rowBack: {
    alignItems: "center",
    backgroundColor: "#DDD",
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingLeft: 15,
    marginBottom: 1,
  },
  backRightBtn: {
    alignItems: "center",
    bottom: 0,
    justifyContent: "center",
    position: "absolute",
    top: 0,
    width: 75,
  },
  backRightBtnRight: {
    backgroundColor: "red",
    right: 0,
  },
  containerStyle: {
    backgroundColor: "white",
    padding: 20,
  },
  containerStyleOpt: {
    backgroundColor: "white",
    position: "absolute",
    top: 0,
    right: 20,
    padding: 20,
  },
});
