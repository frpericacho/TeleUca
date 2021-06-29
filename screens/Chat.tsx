import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionsProps, Actions, GiftedChat, Send } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from "../lib/SupabaseSetUp";
import Message from '../lib/Types/Message'
import { MyUser } from '../lib/AuthProvider';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { ImageInfo } from 'expo-image-picker/build/ImagePicker.types';

const Chat = ({route}:any) => {
    let mySubscription:any = null;
    const [Messages, setMessages] = useState([]);
    const [image, setImage] = useState('');

    const fetchMessages = async () => {
        const { data: messages, error } = await supabase
          .from<Message>('messages')
          .select(`
            *,
            user:user_id (username,avatar_url,id,status)
          `)
          .eq('channel_id',route.params.id)
          .order('id', { ascending: false })
        if (error) console.log('error', error)
        else{
            let mes = messages!.map(function(element){
                return {
                    _id: element.id,
                    text: element.message,
                    createdAt: element.inserted_at,
                    image: element.media_url,
                    user:{
                        _id: element.user.id,
                        name: element.user.username,
                    }
                }
            })
            setMessages(mes!)
            fetchData()
        } 
    }

    async function fetchData(){
        let mySubscription = supabase
            .from("messages")
            .on("INSERT", async (payload) => {
                let { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('id', payload.new.user_id)
                if(!error){
                    let mes = [{
                        _id: payload.new.id,
                        text: payload.new.message,
                        createdAt: payload.new.inserted_at,
                        image: payload.new.media_url,
                        user:{
                            _id: data[0].id,
                            name: data[0].username,
                        }
                    }]
                    if(MyUser.id != payload.new.user_id)
                        setMessages(prevMessages => GiftedChat.append(prevMessages, mes))
                }
            })
            .subscribe();
    }

    useEffect(() => {
        fetchMessages();
    }, [])

    const onSend = async (newMessages = []) => {
        setMessages(GiftedChat.append(Messages, newMessages));
        const { data, error } = await supabase
        .from<Message>('messages')
        .insert([
            { message: newMessages[0].text, user_id: MyUser.id, channel_id: route.params.id},
        ])
        if (error) console.log('error', error)
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
            setImage(result.uri);
            const file = await dataUrlToFile(result);
            console.log('file',file)
            const { data, error } = await supabase
            .storage
            .from('media')
            .upload('images/filename.jpeg', file)
            if (error) console.log('error', error)


            /*const { data, error } = await supabase
            .storage
            .from('avatars')
            .download('space-cat.png')
            let info = await FileSystem.getInfoAsync(result.uri).then(data=>{
                console.log('data',data)
            })*/
            //const file = new Blob([result.uri],{type: 'image/jpeg'})
            //console.log('file',file)
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
                _id: MyUser.id,
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