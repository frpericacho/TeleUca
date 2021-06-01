import { Alert, Text, View } from "react-native";
import React, { useEffect, useState } from 'react';
import { Button } from "react-native-elements";
import { supabase } from "../lib/SupabaseSetUp"
type Chat = {
  id: number
  title: string
  user_id: number
  description: string
  avatar_url: string
}
export default function Home({navigation}) { 

  const [chats, setChats] = useState<Array<Chat>>([])

  useEffect(() => {
    Prueba()
  }, [])

  const Prueba = async () => {
    const { data: chats, error } = await supabase
      .from<Chat>('chats')
      .select('*') 
      .order('id', { ascending: false })
    if (error) console.log('error', error)
    else{
      setChats(chats!)
      console.log('chats',chats)
    }
  }

  return(
      <View>
          <Button 
            title="cerrar sesion"
            onPress={()=>supabase.auth.signOut()}
          />
          <Button 
            title="A la segunda vista"
            onPress={()=>navigation.navigate('SecondHome')}
          />
          <Button 
            title="Prueba Base de Datos"
            onPress={()=>Prueba()}
          />
      </View>
  );
};