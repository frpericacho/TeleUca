import { Text, View } from "react-native";
import React from 'react';
import { Button } from "react-native-elements";
import { supabase } from "../lib/SupabaseSetUp"

export default function Home({navigation}) {
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
      </View>
  );
};