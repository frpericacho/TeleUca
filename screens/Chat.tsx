import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Clipboard,
  Linking,
} from "react-native";
import {
  ActionsProps,
  Actions,
  GiftedChat,
  Send,
  Bubble,
  InputToolbar,
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
  const [UserFirestore, setUserFirestore] = useState<firebase.firestore.DocumentData>();

  //Messages
  const [Messages, setMessages] = useState<any>([]);

  //TitleChat
  const [Title, setTitle] = useState(route.params.title);

  //Admin
  const [Admin, setAdmin] = useState(false);

  //Audio
  const [recording, setRecording] = React.useState<Audio.Recording>();
  const [IsRecording, setIsRecording] = React.useState(false);
  const [sound, setSound] = React.useState<Audio.Sound>();

  //Chat
  const [Chat, setChat] = useState<any>();

  useEffect(() => {
    firebase.firestore().collection('users').where('email','==',MyUserAuth?.email).get().then(async (user) => {
      setUserFirestore(user.docs[0].data())
    })
    //readNewMessages();
  });

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
    //type: group || difusion
    if (route.params.type == "group" || route.params.type == "difusion") {
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
            let message;
            //type: group || difusion
            if (route.params.type == "group" || route.params.type == "difusion") {
              message = {
                to: user.data().token,
                sound: "default",
                title: Title,
                body: text,
                data: { someData: "goes here" },
              };
            } else {
              message = {
                to: user.data().token,
                sound: "default",
                title: MyUserAuth?.email?.split("@")[0],
                body: text,
                data: { someData: "goes here" },
              };
            }

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
              color="#03A9F4"
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
              color="#03A9F4"
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
                  _id: nombre,
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
                          text: "Documento 📄",
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

  const pickImageCamera = async () => {
    ImagePicker.requestCameraPermissionsAsync();
    let result = await ImagePicker.launchCameraAsync();

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
                    _id: nombre,
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
                            text: "Imagen 📷",
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
                    _id: nombre,
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
                            text: "Video 🎬",
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

  const pickImageGallery = async () => {
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
                    _id: nombre,
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
                            text: "Imagen 📷",
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
                    _id: nombre,
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
                            text: "Video 🎬",
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
          ["Abrir galería"]: pickImageGallery,
          ["Abrir cámara"]: pickImageCamera,
          ["Enviar documento"]: pickDocument,
        }}
        icon={() => <Icon name="attachment" size={25} color="#03A9F4" />}
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

  const renderBubble = (props: any) => {
    if (props.currentMessage.user.name == MyUserAuth?.email)
      return (
        <Bubble
          {...props}
          wrapperStyle={{ right: { backgroundColor: "#29B6F6" } }}
        />
      );
    else
      return (
        <Bubble
          {...props}
          wrapperStyle={{
            left: {
              backgroundColor: "#DEDEDE",
            },
          }}
        />
      );
  };

  const renderInputToolbar = (props: any) => {
    //type: difusion
    if (route.params.type == "difusion" && route.params.Admin != MyUserAuth?.email) {
    } else {
    return(
      <InputToolbar
        {...props}
      />
    ); 
  }
  };

  async function startRecording() {
    const { sound } = await Audio.Sound.createAsync(
      require('../assets/pop.mp3')
    );
    setSound(sound);
    await sound.playAsync();

    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
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

    const { sound } = await Audio.Sound.createAsync(
      require('../assets/pop.mp3')
    );
    setSound(sound);
    await sound.playAsync();

    setRecording(undefined);
    setIsRecording(false);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    await FileSystem.getInfoAsync(uri || "")
      .then((file) => {
        let nombre = new Date().toString();
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
                    createdAt: nombre,
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
                            text: "Audio",
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

  const onLongPress = async (context: any, currentMessage: any) => {
    if (currentMessage.text) {
      const options = ["Copiar texto", "Guardar", "Cancelar"];
      const cancelButtonIndex = options.length - 1;
      context.actionSheet().showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        async (buttonIndex: any) => {
          switch (buttonIndex) {
            case 0:
              Clipboard.setString(currentMessage.text);
              break;
            case 1:
              await saveMessage(currentMessage);
              break;
          }
        }
      );
    }
    if (currentMessage.audio) {
      const options = ["Guardar", "Cancelar"];
      const cancelButtonIndex = options.length - 1;
      context.actionSheet().showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        async (buttonIndex: any) => {
          switch (buttonIndex) {
            case 0:
              await saveMessage(currentMessage);
              break;
          }
        }
      );
    }
    if (currentMessage.video) {
      const options = ["Guardar", "Cancel"];
      const cancelButtonIndex = options.length - 1;
      context.actionSheet().showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        async (buttonIndex: any) => {
          switch (buttonIndex) {
            case 0:
              await saveMessage(currentMessage);
              break;
          }
        }
      );
    }
    if (currentMessage.image) {
      const options = ["Guardar", "Cancel"];
      const cancelButtonIndex = options.length - 1;
      context.actionSheet().showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
        },
        async (buttonIndex: any) => {
          switch (buttonIndex) {
            case 0:
              await saveMessage(currentMessage);
              break;
          }
        }
      );
    }
  };

  const saveMessage = async (data: any) => {
    if (data.image) {
      firebase
        .firestore()
        .collection("messages")
        .add({
          _id: data._id,
          chat_id: MyUserAuth?.email,
          image: data.image,
          createdAt: new Date(),
          user: {
            _id: MyUserAuth?.email,
            name: MyUserAuth?.email,
          },
        });
    } else if (data.audio) {
      firebase
        .firestore()
        .collection("messages")
        .add({
          _id: data._id,
          chat_id: MyUserAuth?.email,
          audio: data.audio,
          createdAt: new Date(),
          user: {
            _id: MyUserAuth?.email,
            name: MyUserAuth?.email,
          },
        });
    } else if (data.video) {
      firebase
        .firestore()
        .collection("messages")
        .add({
          _id: data._id,
          chat_id: MyUserAuth?.email,
          video: data.video,
          createdAt: new Date(),
          user: {
            _id: MyUserAuth?.email,
            name: MyUserAuth?.email,
          },
        });
    } else if (data.document) {
      firebase
        .firestore()
        .collection("messages")
        .add({
          _id: data._id,
          chat_id: MyUserAuth?.email,
          document: data.document,
          createdAt: new Date(),
          user: {
            _id: MyUserAuth?.email,
            name: MyUserAuth?.email,
          },
        });
    } else {
      firebase
        .firestore()
        .collection("messages")
        .add({
          _id: data._id,
          chat_id: MyUserAuth?.email,
          text: data.text,
          createdAt: new Date(),
          user: {
            _id: MyUserAuth?.email,
            name: MyUserAuth?.email,
          },
        });
    }
  };

  const createChatOneToOne = async (User:any) => {
    const MyUser = (await firebase.firestore().collection('users').where('email','==',MyUserAuth?.email).get()).docs[0].data()
    //type: individual
    firebase
      .firestore()
      .collection("chats")
      .add({
        avatar_url: [
          {
            email: MyUserAuth?.email,
            avatar_url: MyUser.avatar_url
          },
          {
            email: User.name,
            avatar_url: User.avatar_url
          }
        ],
        description: "",
        title: "",
        titleLowerCase: "",
        type: "individual",
        users: {
          UserList: [MyUserAuth?.email, User.name],
        },
        LastMessage: {},
        NewMessages: [
          {
            email: MyUserAuth?.email,
            NewMessage: false,
          },
          {
            email: User.name,
            NewMessage: false,
          },
        ],
        Admin: "",
      })
      .then((chat) => {
        chat.get().then((docs) => {
          navigation.navigate("Chat", { id: docs.id, ...docs.data() });
        });
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const HandleChatOneToOne = async (User:any) => {
    let docsOther: any = [];
    let docsMe: any = [];
    let docs: any = [];

    //type: individual(ambos)
    firebase
      .firestore()
      .collection("chats")
      .where("type", "==", "individual")
      .where("users.UserList", "==", [User.name, MyUserAuth?.email])
      .get()
      .then((snapshotOther) => {
        firebase
          .firestore()
          .collection("chats")
          .where("type", "==", "individual")
          .where("users.UserList", "==", [MyUserAuth?.email, User.name])
          .get()
          .then((snapshotMe) => {
            docsOther = snapshotOther.docs.map((doc) => {
              return { id: doc.id, ...doc.data() };
            });
            docsMe = snapshotMe.docs.map((doc) => {
              return { id: doc.id, ...doc.data() };
            });

            docs = [...docsOther, ...docsMe];

            if (docs.length != 0) {
              navigation.push("Chat", docs[0]);
            } else {
              createChatOneToOne(User);
            }
          });
      });
  };

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
            <Text>Mensajes guardados</Text>
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
        scrollToBottom
        isTyping
        placeholder="Mensaje"
        renderActions={renderActions}
        renderLoading={rendLoading}
        renderSend={rendSend}
        renderBubble={renderBubble}
        renderMessageVideo={renderMessageVideo}
        renderMessageAudio={renderMessageAudio}
        renderCustomView={renderMessageDocument}
        renderInputToolbar={renderInputToolbar}
        onLongPress={(context, currentMessage) =>
          onLongPress(context, currentMessage)
        }
        onPressAvatar={(message) => HandleChatOneToOne(message)}
        user={{
          _id: firebase.auth().currentUser?.email,
          name: firebase.auth().currentUser?.email,
          avatar: UserFirestore?.avatar_url,
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
