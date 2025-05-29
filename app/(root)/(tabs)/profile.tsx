import {
  View, Text, SafeAreaView, ScrollView, TouchableOpacity, Image, TextInput, Alert, ImageSourcePropType,
} from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
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
  const { id, modo } = useLocalSearchParams();

  const isNuevo = modo === 'nuevo';

  const [isAdmin, setIsAdmin] = useState(false);
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');

  useEffect(() => {
    const verificarAdmin = async () => {
      if (user?.email) {
        const { data, error } = await supabase
          .from('usuarios')
          .select('es_admin')
          .eq('correo', user.email)
          .single();

        if (!error && data?.es_admin === true) {
          setIsAdmin(true);
        }
      }
    };
    verificarAdmin();
  }, [user]);

  useEffect(() => {
    const cargarDatos = async () => {
      if (modo === 'editar' && id) {
        const { data, error } = await supabase
          .from('usuarios')
          .select('nombre, edad, telefono, correo')
          .eq('id', id)
          .single();

        if (error) {
          Alert.alert('Error', 'No se pudieron cargar los datos del maestro');
          return;
        }

        setNombre(data.nombre || '');
        setEdad(data.edad?.toString() || '');
        setTelefono(data.telefono || '');
        setCorreo(data.correo || '');
      } else if (modo === 'nuevo') {
        setNombre('');
        setEdad('');
        setTelefono('');
        setCorreo('');
      } else {
        const { data, error } = await supabase
          .from('usuarios')
          .select('nombre, edad, telefono, correo')
          .eq('correo', user?.email)
          .single();

        if (error) {
          Alert.alert('Error', 'No se pudieron cargar los datos del perfil');
          return;
        }

        setNombre(data.nombre || '');
        setEdad(data.edad?.toString() || '');
        setTelefono(data.telefono || '');
        setCorreo(data.correo || '');
      }
    };

    cargarDatos();
  }, [modo, id, user]);

  const handleGuardar = async () => {
    if (!nombre || !correo) {
      Alert.alert('Error', 'Nombre y correo son obligatorios');
      return;
    }

    if (modo === 'nuevo') {
      const { data: existente } = await supabase
        .from('usuarios')
        .select('id')
        .eq('correo', correo)
        .single();

      if (existente) {
        Alert.alert('Error', 'El correo ya está registrado');
        return;
      }

      const { error } = await supabase.from('usuarios').insert({
        nombre: nombre.trim(),
        edad: parseInt(edad) || null,
        telefono,
        correo: correo.trim(),
        es_admin: false,
      });

      if (error) {
        Alert.alert('Error', 'No se pudo agregar el maestro');
      } else {
        Alert.alert('Éxito', 'Maestro agregado correctamente');
        router.push('/admin');
      }
    } else if (modo === 'editar' && id) {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre: nombre.trim(),
          edad: parseInt(edad) || null,
          telefono,
        })
        .eq('id', id);

      if (error) {
        Alert.alert('Error', 'No se pudo actualizar el maestro');
      } else {
        Alert.alert('Éxito', 'Datos actualizados correctamente');
        // Nos mantenemos en el perfil del maestro editado
      }
    } else {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre: nombre.trim(),
          edad: parseInt(edad) || null,
          telefono,
        })
        .eq('correo', user?.email);

      if (error) {
        Alert.alert('Error', 'No se pudieron guardar los cambios');
      } else {
        Alert.alert('Éxito', 'Cambios guardados correctamente');
      }
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
        <View className="items-center mt-2">
          <Text className="text-2xl font-bold text-red-800">Perfil</Text>
          <Text className="text-xl font-semibold text-red-800 -mt-2">
            {modo === 'editar' ? 'Editar maestro' : modo === 'nuevo' ? 'Nuevo maestro' : 'Personal'}
          </Text>
        </View>

        {isAdmin && (modo === 'editar' || modo === 'nuevo') && (
          <TouchableOpacity className="mt-6" onPress={() => router.push('/admin')}>
            <View className="bg-gray-300 px-6 py-3 rounded-full items-center">
              <Text className="text-red-800 font-semibold">← Regresar al panel admin</Text>
            </View>
          </TouchableOpacity>
        )}

        <View className="mt-4 items-center">
          <Image source={images.avatar} className="w-32 h-32 rounded-full" />
        </View>

        <View className="mt-6 w-full bg-red-800 p-5 rounded-lg space-y-4">
          <View>
            <Text className="text-white mb-1">Nombre:</Text>
            <TextInput
              value={nombre}
              onChangeText={setNombre}
              className="bg-white rounded px-3 py-2"
            />
          </View>

          <View className="flex-row justify-between">
            <View className="w-[48%]">
              <Text className="text-white mb-1">Edad:</Text>
              <TextInput
                value={edad}
                onChangeText={setEdad}
                keyboardType="numeric"
                className="bg-white rounded px-3 py-2"
              />
            </View>
            <View className="w-[48%]">
              <Text className="text-white mb-1">Teléfono:</Text>
              <TextInput
                value={telefono}
                onChangeText={setTelefono}
                keyboardType="phone-pad"
                className="bg-white rounded px-3 py-2"
              />
            </View>
          </View>

          <View>
            <Text className="text-white mb-1">Correo:</Text>
            <TextInput
              value={correo}
              onChangeText={setCorreo}
              editable={modo === 'nuevo' && isAdmin}
              className={`rounded px-3 py-2 ${modo === 'nuevo' && isAdmin ? 'bg-white' : 'bg-gray-200 text-gray-600'}`}
            />
          </View>
        </View>

        <TouchableOpacity className="mt-10" onPress={handleGuardar}>
          <View className="bg-red-700 px-6 py-4 justify-center items-center rounded-full">
            <Text className="text-white text-lg font-semibold">
              {modo === 'nuevo' ? 'CREAR MAESTRO' : 'GUARDAR CAMBIOS'}
            </Text>
          </View>
        </TouchableOpacity>

        {!modo && (
          <View className="flex flex-col mt-8 border-t pt-5 border-gray-300">
            <SettingsItem
              icon={icons.logout}
              title="Cerrar sesión"
              textStyle="text-red-600"
              showArrow={false}
              onPress={handleLogout}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
