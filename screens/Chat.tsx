import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Linking,
} from "react-native";
import {
  ActionsProps,
  Actions,
  GiftedChat,
  Send,
} from "react-native-gifted-chat";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import * as ImagePicker from "expo-image-picker";
import { Audio, Video } from "expo-av";
import firebase from "firebase";
import * as FileSystem from "expo-file-system";
import AudioSlider from "../components/AudioPlayer/AudioSlider";
import * as DocumentPicker from "expo-document-picker";

const Chat = ({ route, navigation }: any) => {
  //MyUser
  const MyUserAuth = firebase.auth().currentUser;

  //Messages
  const [Messages, setMessages] = useState<any>([]);

  //TitleChat
  const [Title, setTitle] = useState(route.params.title);

  //Admin
  const [Admin, setAdmin] = useState(false);

  //Audio
  const [recording, setRecording] = React.useState<Audio.Recording>();
  const [IsRecording, setIsRecording] = React.useState(false);

  //Chat
  const [Chat, setChat] = useState<any>();

  useEffect(() => {
    readNewMessages()
  })

  useEffect(() => {
    const willFocusSubscription = navigation.addListener("focus", async () => {
      setChat({
        id: firebase.firestore().collection("chats").doc(route.params.id).id,
        ...(
          await firebase
            .firestore()
            .collection("chats")
            .doc(route.params.id)
            .get()
        ).data(),
      });
      getTitleChat();
    });
    checkAdmin();
    readNewMessages();
    firebase
      .firestore()
      .collection("messages")
      .where("chat_id", "==", route.params.id)
      .orderBy("createdAt", "desc")
      .onSnapshot((snapshot) => {
        setMessages(
          snapshot.docs.map((doc) => ({
            _id: doc.data()._id,
            createdAt: doc.data().createdAt.toDate(),
            text: doc.data().text,
            user: doc.data().user,
            image: doc.data().image,
            video: doc.data().video,
            audio: doc.data().audio,
            document: doc.data().document,
          }))
        );
      });
    return willFocusSubscription;
  }, []);

  const checkAdmin = async () => {
    if (route.params.Admin == MyUserAuth?.email) {
      setAdmin(true);
    } else {
      setAdmin(false);
    }
  };

  const getTitleChat = async () => {
    if (route.params.group) {
      setTitle(
        (
          await firebase
            .firestore()
            .collection("chats")
            .doc(route.params.id)
            .get()
        ).data()?.title
      );
    } else {
      let titleDisplay = route.params.users.UserList.filter((email: string) => {
        return email != MyUserAuth?.email;
      });
      setTitle(titleDisplay[0].split("@")[0]);
    }
  };

  const readNewMessages = async () => {
   firebase
      .firestore()
      .collection("chats")
      .doc(route.params.id)
      .get()
      .then((chat) => {
        let NewMessagesAux = chat.data()?.NewMessages;

        NewMessagesAux.filter((users: any) => {
          return users.email == firebase.auth().currentUser?.email;
        }).map((users: any) => {
          users.NewMessage = false;
        });
        chat.ref.update({
          NewMessages: NewMessagesAux,
        });
      });
  };

  const sendPushNotification = async (email: string, text: string) => {
    firebase
      .firestore()
      .collection("users")
      .where("email", "==", email)
      .get()
      .then((snapshot) => {
        snapshot.docs
          .filter((user) => {
            return user.data().email != firebase.auth().currentUser?.email;
          })
          .forEach(async (user) => {
            const message = {
              to: user.data().token,
              sound: "default",
              title: "Mensaje Nuevo",
              body: text,
              data: { someData: "goes here" },
            };

            await fetch("https://exp.host/--/api/v2/push/send", {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Accept-encoding": "gzip, deflate",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(message),
            });
          });
      });
  };

  const sendNotificationToGroupUsers = async (text: string) => {
    let usersChat = (
      await firebase.firestore().collection("chats").doc(route.params.id).get()
    ).data()?.users.UserList;
    usersChat.forEach((user: string) => {
      sendPushNotification(user, text);
    });
  };

  const onSend = async (newMessages = []) => {
    setMessages(GiftedChat.append(Messages, newMessages));
    const { _id, text, user, createdAt } = newMessages[0];
    firebase
      .firestore()
      .collection("messages")
      .add({
        _id: _id,
        chat_id: route.params.id,
        text: text,
        createdAt: createdAt,
        user: user,
      })
      .then(() => {
        firebase
          .firestore()
          .collection("chats")
          .doc(route.params.id)
          .get()
          .then((chat) => {
            let NewMessagesAux = chat.data()?.NewMessages;

            NewMessagesAux.filter((users: any) => {
              return users.email != firebase.auth().currentUser?.email;
            }).map((users: any) => {
              users.NewMessage = true;
            });
            chat.ref.update({
              LastMessage: {
                _id,
                text,
                user,
                createdAt,
              },
              NewMessages: NewMessagesAux,
            });
          });
      })
      .catch((err) => {
        console.log(err);
      });
    sendNotificationToGroupUsers(text);
  };

  const rendSend = (props: any) => {
    if (!props.text.trim()) {
      return (
        <View>
          <TouchableOpacity
            onPressIn={startRecording}
            onPressOut={stopRecording}
          >
            <Icon
              name={IsRecording ? "microphone" : "microphone-outline"}
              size={35}
              color="#00bde6"
              style={{ marginBottom: 5, marginRight: 5 }}
            />
          </TouchableOpacity>
        </View>
      );
    } else {
      return (
        <Send {...props}>
          <View>
            <Icon
              name="send-circle"
              size={35}
              color="#00bde6"
              style={{ marginBottom: 5, marginRight: 5 }}
            />
          </View>
        </Send>
      );
    }
  };

  const rendLoading = () => {
    return (
      <View style={styles.loadingContainer}>
        <Icon name="loading" size={35} color="#6646ee" />
      </View>
    );
  };

  const pickDocument = async () => {
    let result = await DocumentPicker.getDocumentAsync({});

    if (result.type != "cancel") {
      let nombre = new Date().toString();
      uploadImage(result.uri)
        .then((resolve: any) => {
          let ref = firebase.storage().ref().child(`media/${nombre}`);

          ref.put(resolve).then((resolve) => {
            resolve.ref.getDownloadURL().then((url) => {
              firebase
                .firestore()
                .collection("messages")
                .add({
                  _id: new Date().toString(),
                  chat_id: route.params.id,
                  createdAt: new Date(),
                  user: {
                    _id: firebase.auth().currentUser?.email,
                    name: firebase.auth().currentUser?.email,
                  },
                  document: url,
                })
                .then(() => {
                  firebase
                    .firestore()
                    .collection("chats")
                    .doc(route.params.id)
                    .get()
                    .then((chat) => {
                      let NewMessagesAux = chat.data()?.NewMessages;

                      NewMessagesAux.filter((users: any) => {
                        return (
                          users.email != firebase.auth().currentUser?.email
                        );
                      }).map((users: any) => {
                        users.NewMessage = true;
                      });
                      chat.ref.update({
                        LastMessage: {
                          _id: nombre,
                          text: "",
                          user: {
                            _id: firebase.auth().currentUser?.email,
                            name: firebase.auth().currentUser?.email,
                          },
                          createdAt: nombre,
                        },
                        NewMessages: NewMessagesAux,
                      });
                    });
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
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      let nombre = new Date().toString();
      if (result.type == "image") {
        uploadImage(result.uri)
          .then((resolve: any) => {
            let ref = firebase.storage().ref().child(`media/${nombre}`);

            ref.put(resolve).then((resolve) => {
              resolve.ref.getDownloadURL().then((url) => {
                firebase
                  .firestore()
                  .collection("messages")
                  .add({
                    _id: new Date().toString(),
                    chat_id: route.params.id,
                    createdAt: new Date(),
                    user: {
                      _id: firebase.auth().currentUser?.email,
                      name: firebase.auth().currentUser?.email,
                    },
                    image: url,
                  })
                  .then(() => {
                    firebase
                      .firestore()
                      .collection("chats")
                      .doc(route.params.id)
                      .get()
                      .then((chat) => {
                        let NewMessagesAux = chat.data()?.NewMessages;

                        NewMessagesAux.filter((users: any) => {
                          return (
                            users.email != firebase.auth().currentUser?.email
                          );
                        }).map((users: any) => {
                          users.NewMessage = true;
                        });
                        chat.ref.update({
                          LastMessage: {
                            _id: nombre,
                            text: "",
                            user: {
                              _id: firebase.auth().currentUser?.email,
                              name: firebase.auth().currentUser?.email,
                            },
                            createdAt: nombre,
                          },
                          NewMessages: NewMessagesAux,
                        });
                      });
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
      } else {
        uploadImage(result.uri)
          .then((resolve: any) => {
            let ref = firebase.storage().ref().child(`media/${nombre}`);

            ref.put(resolve).then((resolve) => {
              resolve.ref.getDownloadURL().then((url) => {
                firebase
                  .firestore()
                  .collection("messages")
                  .add({
                    _id: new Date().toString(),
                    chat_id: route.params.id,
                    createdAt: new Date(),
                    user: {
                      _id: firebase.auth().currentUser?.email,
                      name: firebase.auth().currentUser?.email,
                    },
                    video: url,
                  })
                  .then(() => {
                    firebase
                      .firestore()
                      .collection("chats")
                      .doc(route.params.id)
                      .get()
                      .then((chat) => {
                        let NewMessagesAux = chat.data()?.NewMessages;

                        NewMessagesAux.filter((users: any) => {
                          return (
                            users.email != firebase.auth().currentUser?.email
                          );
                        }).map((users: any) => {
                          users.NewMessage = true;
                        });
                        chat.ref.update({
                          LastMessage: {
                            _id: nombre,
                            text: "",
                            user: {
                              _id: firebase.auth().currentUser?.email,
                              name: firebase.auth().currentUser?.email,
                            },
                            createdAt: nombre,
                          },
                          NewMessages: NewMessagesAux,
                        });
                      });
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

  const renderActions = (props: Readonly<ActionsProps>) => {
    return (
      <Actions
        {...props}
        options={{
          ["Enviar imagen/video"]: pickImage,
          ["Enviar documento"]: pickDocument,
        }}
        icon={() => <Icon name="attachment" size={25} color="#6646ee" />}
      />
    );
  };

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

  const renderMessageVideo = (props: any) => {
    return (
      <View style={{ height: 250, width: 250 }}>
        <Video
          resizeMode="stretch"
          useNativeControls
          shouldPlay={false}
          source={{ uri: props.currentMessage.video }}
          style={{ height: 250, width: 250 }}
        />
      </View>
    );
  };

  const renderMessageAudio = (props: any) => {
    return (
      <View style={{ width: 240 }}>
        <AudioSlider audio={props.currentMessage.audio} />
      </View>
    );
  };

  const renderMessageDocument = (props: any) => {
    if (props.currentMessage.document) {
      return (
        <View style={props.containerStyle}>
          <Icon
            onPress={() => Linking.openURL(props.currentMessage.document)}
            name="file-pdf"
            size={35}
            color="#FFF"
            style={{ padding: 20 }}
          />
        </View>
      );
    }
    return null;
  };

  async function startRecording() {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log("Starting recording..");
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await recording.startAsync();
      setRecording(recording);
      setIsRecording(true);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    setRecording(undefined);
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    await FileSystem.getInfoAsync(uri || "")
      .then((file) => {
        let nombre = new Date().toString();
        console.log("file.uri", file.uri);
        uploadImage(file.uri)
          .then((resolve: any) => {
            let ref = firebase.storage().ref().child(`media/${nombre}`);

            ref.put(resolve).then((resolve) => {
              resolve.ref.getDownloadURL().then((url) => {
                firebase
                  .firestore()
                  .collection("messages")
                  .add({
                    _id: nombre,
                    chat_id: route.params.id,
                    createdAt: new Date(),
                    user: {
                      _id: firebase.auth().currentUser?.email,
                      name: firebase.auth().currentUser?.email,
                    },
                    audio: url,
                  })
                  .then(() => {
                    firebase
                      .firestore()
                      .collection("chats")
                      .doc(route.params.id)
                      .get()
                      .then((chat) => {
                        let NewMessagesAux = chat.data()?.NewMessages;

                        NewMessagesAux.filter((users: any) => {
                          return (
                            users.email != firebase.auth().currentUser?.email
                          );
                        }).map((users: any) => {
                          users.NewMessage = true;
                        });
                        chat.ref.update({
                          LastMessage: {
                            _id: nombre,
                            text: "",
                            user: {
                              _id: firebase.auth().currentUser?.email,
                              name: firebase.auth().currentUser?.email,
                            },
                            createdAt: nombre,
                          },
                          NewMessages: NewMessagesAux,
                        });
                      });
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
      })
      .catch((error) => {
        console.log(error);
      });
  }

  return (
    <View style={{ display: "flex", height: "100%" }}>
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
          {route.params.id == MyUserAuth?.email ? (
            <Text>Mensages guardados</Text>
          ) : (
            <Text>{Title}</Text>
          )}
        </View>
        <View style={{ marginRight: 15 }}>
          {route.params.id == MyUserAuth?.email ? (
            <Icon name="dots-vertical" size={30} color="white" />
          ) : (
            <Icon
              name="dots-vertical"
              size={30}
              color="#900"
              onPress={async () =>
                (await Admin)
                  ? navigation.navigate("ChatOptions", {
                      title: Title,
                      chat: Chat,
                      Admin: true,
                    })
                  : navigation.navigate("ChatOptions", {
                      title: Title,
                      chat: Chat,
                      Admin: false,
                    })
              }
            />
          )}
        </View>
      </View>
      <GiftedChat
        messages={Messages}
        onSend={(messages) => onSend(messages)}
        alwaysShowSend
        showAvatarForEveryMessage
        messageIdGenerator={() => Date().toString()}
        scrollToBottom
        isTyping
        renderMessageVideo={renderMessageVideo}
        renderActions={renderActions}
        renderLoading={rendLoading}
        renderSend={rendSend}
        renderMessageAudio={renderMessageAudio}
        renderCustomView={renderMessageDocument}
        user={{
          _id: firebase.auth().currentUser?.email,
          name: firebase.auth().currentUser?.email,
        }}
      />
    </View>
  );
};
export default Chat;

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
