import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionsProps, Actions, GiftedChat, Send } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types';
import { Audio, Video } from 'expo-av';
import firebase from 'firebase';

const Chat = ({route}:any) => {

    const [Messages, setMessages] = useState([]);
    const [Image, setImage] = useState('');

    useLayoutEffect(() => {
        let docs:any = [];
        firebase.firestore().collection('messages').where('chat_id','==',route.params.id).orderBy('createdAt','desc').onSnapshot((snapshot)=>{
           setMessages(
                snapshot.docs.map(doc=>({
                    _id: doc.data()._id,
                    createdAt: doc.data().createdAt,
                    text: doc.data().text,
                    user: doc.data().user,
                    image: doc.data().image,
                    video: doc.data().video
                }))
            )
        })
    }, [])

    const onSend = async (newMessages = []) => {
        setMessages(GiftedChat.append(Messages, newMessages));
        const {
            _id,
            text,
            user
        }=newMessages[0]
        firebase.firestore().collection('messages').add({
            _id: _id,
            chat_id: route.params.id,
            text: text,
            createdAt: new Date().toString(),
            user: user,
        }).catch((err)=>{
            console.log(err)
        })
    }

    const rendSend = (props:any) =>{
        return (
            <Send {...props}>
                <View>
                    <Icon name="send-circle" size={35} color="#00bde6" style={{marginBottom:5, marginRight:5}}/>
                </View>
            </Send>
        )
    }

    const rendLoading = () => {
        return (
            <View style={styles.loadingContainer}>
              <Icon name="loading" size={35} color='#6646ee' />
            </View>
        );
    }

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1
        });
        
        if (!result.cancelled) {
            let nombre = new Date().toString()
            if(result.type=="image"){
                uploadImage(result.uri).then((resolve)=>{
                    let ref = firebase
                    .storage()
                    .ref()
                    .child(`media/${nombre}`);
                    
                    ref.put(resolve).then(resolve =>{
                        resolve.ref.getDownloadURL().then(url=>{
                            firebase.firestore().collection('messages').add({
                                _id: new Date().toString(),
                                chat_id: route.params.id,
                                createdAt: new Date().toString(),
                                user: {
                                    _id: firebase.auth().currentUser?.email,
                                    name: firebase.auth().currentUser?.email
                                },
                                image: url,
                            }).catch((err)=>{
                                console.log(err)
                            })
                        })
                    })
    
                }).catch(error=>{
                    console.log(error);
                })
            }else{
                uploadImage(result.uri).then((resolve)=>{
                    let ref = firebase
                    .storage()
                    .ref()
                    .child(`media/${nombre}`);
                    
                    ref.put(resolve).then(resolve =>{
                        resolve.ref.getDownloadURL().then(url=>{
                            firebase.firestore().collection('messages').add({
                                _id: new Date().toString(),
                                chat_id: route.params.id,
                                createdAt: new Date().toString(),
                                user: {
                                    _id: firebase.auth().currentUser?.email,
                                    name: firebase.auth().currentUser?.email
                                },
                                video: url,
                            }).catch((err)=>{
                                console.log(err)
                            })
                        })
                    })
    
                }).catch(error=>{
                    console.log(error);
                })
            }
        }
    };

    const renderActions = (props: Readonly<ActionsProps>) => {
        return (
            <Actions
                {...props}
                options={{['Enviar imagen']:pickImage}}
                icon={()=>(
                    <Icon name="attachment" size={25} color='#6646ee' />
                )}
            />
        )
    }
    
    const uploadImage = (uri:string) => {
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
        const { currentMessage } = props;
        console.log('currentMessage',currentMessage)
        return (
          <View style={{height:250, width:250}}>
             <Video
              resizeMode="stretch"
              useNativeControls
              shouldPlay={false}
              source={{ uri: currentMessage.video }}
              style={{height:250, width:250}}
            />
          </View>
        );
      };

    return(
        <GiftedChat
            messages={Messages}
            onSend={messages => onSend(messages)}
            alwaysShowSend
            showAvatarForEveryMessage
            scrollToBottom
            isTyping
            renderMessageVideo={renderMessageVideo}
            renderActions={renderActions}
            renderLoading={rendLoading}
            renderSend={rendSend}
            user={{
                _id: firebase.auth().currentUser?.email,
                name: firebase.auth().currentUser?.email
            }}
        />
    )
    
}
export default Chat;

async function dataUrlToFile(image: ImageInfo): Promise<File> {
    const imgExt = image.uri.split('.').pop();
    let type = 'image/png';
    if (imgExt!.toLowerCase() !== 'png') {
        type = 'image/jpg';
    }
    
    try {
        const res = await fetch(image.uri)
        console.log('res')
        const blob: Blob = await res.blob();
        console.log('blob')
        return new File([blob], 'fileName.'+imgExt, { type });
    } catch (error) {
        console.log(error)
        return new File([],'sdfsd.txt')
    }
}

const styles = StyleSheet.create({
    // rest remains same
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });