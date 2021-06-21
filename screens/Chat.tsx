import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { GiftedChat, Send } from 'react-native-gifted-chat';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { supabase } from "../lib/SupabaseSetUp";
import Message from '../lib/Types/Message'
import { MyUser } from '../lib/AuthProvider';

const Chat = ({route}:any) => {
    //const [messages, setMessages] = useState<Array<Message>>([]);

    let mySubscription:any = null;
    const [messages, setMessages] = useState([]);
    const [sliceCount, setSliceCount] = useState(10);
    const [slicedMessages, setSlicedMessages] = useState([]);
    const [error, setError] = useState("");
    const [loadingInitial, setLoadingInitial] = useState(true);
    const [newIncomingMessageTrigger, setNewIncomingMessageTrigger] = useState(
        null
    );

    const handleNewMessage = (payload:any) => {
        //* Sliced messages are already reversed
        setSlicedMessages((prevSliced):any => [...prevSliced, payload.new]);
        setMessages((prevMessages):any => [payload.new, ...prevMessages]);
        //* needed to trigger react state because I need access to the username state
        setNewIncomingMessageTrigger(payload.new);
      };
    
      const getInitialMessages = async () => {
        if (!messages.length) {
          const { data, error } = await supabase
            .from("messages")
            .select()
            .order("id", { ascending: false });
          // console.log(`data`, data);
          setLoadingInitial(false);
          if (error) {
            setError(error.message);
            supabase.removeSubscription(mySubscription);
            mySubscription = null;
            return;
          }
          setSlicedMessages(data.slice(0, sliceCount).reverse());
          setMessages(data);
        }
      };
    
      const getMessagesAndSubscribe = async () => {
        setError("");
        if (!mySubscription) {
          getInitialMessages();
          mySubscription = supabase
            .from("messages")
            .on("*", (payload) => {
              handleNewMessage(payload);
            })
            .subscribe();
        }
      };

//  Sin uso de RealTime
/* 
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
        } 
    }
*/
    useEffect(() => {
        //fetchMessages();
        getMessagesAndSubscribe();
    }, [])

    const onSend = async (newMessages = []) => {
        
        setMessages(GiftedChat.append(messages, newMessages));

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

    const rendLoading = () =>{
        return (
            <View style={styles.loadingContainer}>
              <Icon name="loading" size={35} color='#6646ee' />
            </View>
        );
    }

    return(
        <GiftedChat
            messages={messages}
            onSend={messages => onSend(messages)}
            alwaysShowSend
            showAvatarForEveryMessage
            scrollToBottom
            isTyping
            renderLoading={rendLoading}
            renderSend={rendSend}
            user={{
                _id: MyUser.id,
            }}
        />
    )
}
export default Chat;

const styles = StyleSheet.create({
    // rest remains same
    loadingContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });