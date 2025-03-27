import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, ImageSourcePropType, Alert,  } from 'react-native'
import React from 'react'
import icons from '@/constants/icons'
import images from '@/constants/images'
import { useGlobalContext } from '@/lib/global-provider';
import { logout } from '@/lib/appwrite';
import Header from '@/assets/Components/header';

interface SettingsItemProps {
  icon: ImageSourcePropType;
  title: string;
  onPress: () => void;
  textStyle?: string;
  showArrow?: boolean;
}

const SettingsItem = ({ icon, title, onPress, textStyle, showArrow = true}: SettingsItemProps) => (
  <TouchableOpacity onPress={onPress}>
    <View>
      <Image source={icon}></Image>
      <Text>{title}</Text>
    </View>
  </TouchableOpacity>
)

const profile = () => {
  const { user, refetch} = useGlobalContext();

  const handleLogout = async () => {
    const result = await logout();

    if(result){
      Alert.alert("Succes", "You have logged out successfully");
      refetch();
    }else{
      Alert.alert("Error", "An error accurred while logging out")
    }
  };
    

  return (
    <SafeAreaView className='h-full bg-while'>
      <ScrollView
          showsVerticalScrollIndicator={false}contentContainerClassName='pb-32 px-7'
      >
        <View className='justify-center items-center flex flex-col'>
          <Image source={images.avatar} className='rounded-full'></Image>
          <Text className='text-2xl'>Roberto Carlos</Text>
        </View>

        <View className='bg-red-600 rounded-lg'>
          <View className='flex flex-row m-5'>
            <Text className='text-white'>Correo electronico:</Text>
            <Text className='pl-2 text-white'>Alexis@gmail.com</Text>
          </View>
          <View className='flex flex-row m-5'>
            <Text className='text-white'>Numero de telefono</Text>
            <Text className='pl-2 text-white'>3525236985</Text>
          </View>

          <View className='flex flex-row m-5'>
            <Text className='text-white'>Edad</Text>
            <Text className='pl-2 text-white'>49</Text>
          </View>
        </View>

        <TouchableOpacity className='m-2 mt-10 '>
          <View className='bg-red-600 w-50 p-5 justify-center items-center rounded-full'>
            <Text className='text-white text-xl'>Guardar Cambios</Text>
          </View>
        </TouchableOpacity>

        <View className='flex flex-col mt-5 border-t pt-5 border-primary-200'>
          <SettingsItem icon={icons.logout} title='Logout' textStyle='text-danger' showArrow={false} onPress={handleLogout}/>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default profile