import { View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, Alert, ImageSourcePropType } from 'react-native';
import React, { useState, useEffect } from 'react';
import icons from '@/constants/icons';
import images from '@/constants/images';
import { useGlobalContext } from '@/lib/global-provider';
import { logout } from '@/lib/appwrite';
import { supabase } from '@/utils/supabase';

interface SettingsItemProps {
  icon: ImageSourcePropType;
  title: string;
  onPress: () => void;
  textStyle?: string;
  showArrow?: boolean;
}

const SettingsItem = ({ icon, title, onPress, textStyle, showArrow = true }: SettingsItemProps) => (
  <TouchableOpacity onPress={onPress}>
    <View className="flex-row items-center gap-2 px-2">
      <Image source={icon} className="w-6 h-6" />
      <Text className={`text-base ${textStyle}`}>{title}</Text>
    </View>
  </TouchableOpacity>
);

const Profile = () => {
  const { user, refetch } = useGlobalContext();

  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.email) return;

      const { data, error } = await supabase
        .from('usuarios')
        .select('nombre, edad, telefono')
        .eq('correo', user.email)
        .single();

      if (error) {
        console.error('Error al obtener datos del usuario:', error.message);
        Alert.alert('Error', 'No se pudieron cargar los datos del perfil');
        return;
      }

      setName(data.nombre || '');
      setAge(data.edad?.toString() || '');
      setPhone(data.telefono || '');
    };

    fetchUserData();
  }, [user]);

  const handleSaveChanges = async () => {
    if (!user?.email) return;

    const { error } = await supabase
      .from('usuarios')
      .update({
        nombre: name,
        edad: parseInt(age),
        telefono: phone,
      })
      .eq('correo', user.email);

    if (error) {
      console.error('Error al guardar cambios:', error.message);
      Alert.alert('Error', 'No se pudieron guardar los cambios');
    } else {
      Alert.alert('Éxito', 'Los cambios se guardaron correctamente');
    }
  };

  const handleLogout = async () => {
    const result = await logout();

    if (result) {
      Alert.alert('Éxito', 'Has cerrado sesión correctamente');
      refetch();
    } else {
      Alert.alert('Error', 'Hubo un problema al cerrar sesión');
    }
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-32 px-6">
        {/* Encabezado */}
        <View className="items-center mt-2">
          <Text className="text-2xl font-bold text-red-800">Perfil</Text>
          <Text className="text-xl font-semibold text-red-800 -mt-2">personal</Text>
        </View>

        {/* Imagen de perfil */}
        <View className="mt-4 items-center">
          <Image source={images.avatar} className="w-32 h-32 rounded-full" />
        </View>

        {/* Caja de datos */}
        <View className="mt-6 w-full bg-red-800 p-5 rounded-lg space-y-4">
          {/* Nombre */}
          <View>
            <Text className="text-white mb-1">Nombre:</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              className="bg-white rounded px-3 py-2"
            />
          </View>

          {/* Edad y Teléfono */}
          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <Text className="text-white mb-1">Edad:</Text>
              <TextInput
                value={age}
                onChangeText={setAge}
                keyboardType="numeric"
                className="bg-white rounded px-3 py-2"
              />
            </View>

            <View className="w-[48%]">
              <Text className="text-white mb-1">Teléfono:</Text>
              <TextInput
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                className="bg-white rounded px-3 py-2"
              />
            </View>
          </View>

          {/* Correo (solo lectura) */}
          <View>
            <Text className="text-white mb-1">Correo:</Text>
            <TextInput
              value={user?.email || ''}
              editable={false}
              selectTextOnFocus={false}
              className="bg-gray-200 text-gray-600 rounded px-3 py-2"
            />
          </View>
        </View>

        {/* Botón de guardar */}
        <TouchableOpacity className="mt-10" onPress={handleSaveChanges}>
          <View className="bg-red-700 px-6 py-4 justify-center items-center rounded-full">
            <Text className="text-white text-lg font-semibold">GUARDAR CAMBIOS</Text>
          </View>
        </TouchableOpacity>

        {/* Logout */}
        <View className="flex flex-col mt-8 border-t pt-5 border-gray-300">
          <SettingsItem
            icon={icons.logout}
            title="Cerrar sesión"
            textStyle="text-red-600"
            showArrow={false}
            onPress={handleLogout}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
