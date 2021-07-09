import React, { useEffect, useLayoutEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionsProps, Actions, GiftedChat, Send } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Message from '../lib/Types/Message'
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types';
import firebase from 'firebase';

const Chat = ({route}:any) => {

    let mySubscription:any = null;
    const [Messages, setMessages] = useState([]);
    const [image, setImage] = useState('');

    useLayoutEffect(() => {
        let docs:any = [];
        firebase.firestore().collection('messages').where('chat_id','==',route.params.id).orderBy('createdAt','desc').onSnapshot((snapshot)=>{
           setMessages(
                snapshot.docs.map(doc=>({
                    _id: doc.data()._id,
                    createdAt: doc.data().createdAt,
                    text: doc.data().text,
                    user: doc.data().user,
                }))
            )
        })
    }, [])

    const onSend = async (newMessages = []) => {
        setMessages(GiftedChat.append(Messages, newMessages));
        const {
            _id,
            createdAt,
            text,
            user
        }=newMessages[0]
        firebase.firestore().collection('messages').add({
            _id: _id,
            chat_id: route.params.id,
            text: text,
            createdAt: new Date().toString(),
            user: user
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
          quality: 1,
          base64: true
        });
        
        if (!result.cancelled) {
            //Subir a bucket
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
    
    return(
        <GiftedChat
            /*messages={Messages.map(({id,data})=>{
                return data;
            })}*/
            messages={Messages}
            onSend={messages => onSend(messages)}
            alwaysShowSend
            showAvatarForEveryMessage
            scrollToBottom
            isTyping
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