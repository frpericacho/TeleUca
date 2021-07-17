import React, { useLayoutEffect, useState } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { ActionsProps, Actions, GiftedChat, Send, Time } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import * as ImagePicker from 'expo-image-picker';
import { Audio, Video } from 'expo-av';
import firebase from 'firebase';
import { Button } from 'react-native-elements/dist/buttons/Button';
import * as FileSystem from 'expo-file-system'
const soundObject = new Audio.Sound();

const Chat = ({route}:any) => {

    const [Messages, setMessages] = useState([]);
    const [recording, setRecording] = React.useState();
    const [playing, setPlaying] = React.useState(false);
    const [state, setState] = React.useState({
        playbackObj: null,
        soundObjt: null,
        currentAudio: {}
    })

    let info;

    useLayoutEffect(() => {
        firebase.firestore().collection('messages').where('chat_id','==',route.params.id).orderBy('createdAt','desc').onSnapshot((snapshot)=>{
           setMessages(
                snapshot.docs.map(doc=>({
                    _id: doc.data()._id,
                    createdAt: doc.data().createdAt.toDate(),
                    text: doc.data().text,
                    user: doc.data().user,
                    image: doc.data().image,
                    video: doc.data().video,
                    audio: doc.data().audio
                }))
            )
        })
    }, [])

    const onSend = async (newMessages = []) => {
        setMessages(GiftedChat.append(Messages, newMessages));
        const {
            _id,
            text,
            user,
            createdAt
        }=newMessages[0]
        firebase.firestore().collection('messages').add({
            _id: _id,
            chat_id: route.params.id,
            text: text,
            createdAt: createdAt,
            user: user,
        }).catch((err)=>{
            console.log(err)
        })
    }

    const rendSend = (props:any) =>{
        if(!props.text.trim()){
            return (
                <View >
                    <Icon onPress={startRecording} name="microphone" size={35} color="#00bde6" style={{marginBottom:5, marginRight:5}}/>
                </View>
            )
        }else{
            
            return (
                <Send {...props}>
                    <View>
                        <Icon name="send-circle" size={35} color="#00bde6" style={{marginBottom:5, marginRight:5}}/>
                    </View>
                </Send>
            )
        }
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
                uploadImage(result.uri).then((resolve:any)=>{
                    let ref = firebase
                    .storage()
                    .ref()
                    .child(`media/${nombre}`);
                    
                    ref.put(resolve).then(resolve =>{
                        resolve.ref.getDownloadURL().then(url=>{
                            firebase.firestore().collection('messages').add({
                                _id: new Date().toString(),
                                chat_id: route.params.id,
                                createdAt: new Date(),
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
                uploadImage(result.uri).then((resolve:any)=>{
                    let ref = firebase
                    .storage()
                    .ref()
                    .child(`media/${nombre}`);
                    
                    ref.put(resolve).then(resolve =>{
                        resolve.ref.getDownloadURL().then(url=>{
                            firebase.firestore().collection('messages').add({
                                _id: new Date().toString(),
                                chat_id: route.params.id,
                                createdAt: new Date(),
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
                options={{['Enviar imagen/video']:pickImage,['Enviar Audio']:startRecording}}
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
        return (
          <View style={{height:250, width:250}}>
             <Video
              resizeMode="stretch"
              useNativeControls
              shouldPlay={false}
              source={{ uri: props.currentMessage.video }}
              style={{height:250, width:250}}
            />
          </View>
        );
    };

    const renderMessageAudio = (props: any) => {
        return (
          <View style={{height:50, width:250}}>
            <Button icon={playing ?
                <Icon name="pause" size={25} color='#6646ee' onPress={()=>{handleAudio(props.currentMessage)}}/>
                :
                <Icon name="play" size={25} color='#6646ee' onPress={()=>{handleAudio(props.currentMessage)}}/>
            } title="" />
          </View>
        );
    };

    async function handleAudio (props:any) {
        if(state.soundObjt === null){
            const playbackObj = new Audio.Sound()
            const status = await playbackObj.loadAsync({uri:props.audio},{shouldPlay:true})
            setPlaying(true)
            return setState({...state, playbackObj:playbackObj, soundObjt: status, currentAudio: props.audio})
        }
        if(state.soundObjt?.isLoaded && state.soundObjt?.isPlaying){
            const status = await state.playbackObj?.setStatusAsync({shouldPlay:false})
            setPlaying(false)
            return setState({...state, soundObjt: status})
        }
        if(state.soundObjt?.isLoaded && !state.soundObjt?.isPlaying && state.currentAudio.id === props.audio.id){
            const status = await state.playbackObj?.playAsync({shouldPlay:true})
            setPlaying(true)
            return setState({...state, soundObjt: status})
        }
    }

    async function startRecording() {
        try {
          console.log('Requesting permissions..'); 
          await Audio.requestPermissionsAsync();
          await Audio.setAudioModeAsync({
            allowsRecordingIOS: true,
            playsInSilentModeIOS: true, 
          }); 
          console.log('Starting recording..');
          const recording = new Audio.Recording();
          await recording.prepareToRecordAsync(Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY);
          await recording.startAsync(); 
          setRecording(recording);
          console.log('Recording started');
        } catch (err) {
          console.error('Failed to start recording', err);
        }
    }
    
    async function stopRecording() {
        console.log('Stopping recording..');
        setRecording(undefined);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI(); 
        //globalURI = uri;
        //console.log('Recording stopped and stored at', globalURI);
        info = await FileSystem.getInfoAsync(uri || "");
        console.log(`FILE INFO: ${JSON.stringify(info)}`);
    }
    
    return(
        <GiftedChat
            messages={Messages}
            onSend={messages => onSend(messages)}
            alwaysShowSend
            showAvatarForEveryMessage
            messageIdGenerator={()=>Date().toString()}
            scrollToBottom
            isTyping
            renderMessageVideo={renderMessageVideo}
            renderActions={renderActions}
            renderLoading={rendLoading}
            renderSend={rendSend}
            renderMessageAudio={renderMessageAudio}
            user={{
                _id: firebase.auth().currentUser?.email,
                name: firebase.auth().currentUser?.email
            }}
        />
    )
    
}
export default Chat;

const styles = StyleSheet.create({
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    }
});