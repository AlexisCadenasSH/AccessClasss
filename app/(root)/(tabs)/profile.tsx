import {View,Text,SafeAreaView,ScrollView,TouchableOpacity,Image,TextInput,Alert,} 
from 'react-native';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import icons from '@/constants/icons';
import images from '@/constants/images';
import { useGlobalContext } from '@/lib/global-provider';
import { logout } from '@/lib/appwrite';
import { supabase } from '@/utils/supabase';

const Profile = () => {
  const { user, refetch } = useGlobalContext();
  const { id, modo } = useLocalSearchParams<{ id?: string; modo?: string }>();

  const isNuevo = modo === 'nuevo';
  const isEditar = modo === 'editar';

  // Aquí defines que isAdmin puede ser boolean o null (inicialmente null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

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
        } else {
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };
    verificarAdmin();
  }, [user]);

  useEffect(() => {
    const cargarDatos = async () => {
      if (isNuevo) {
        setNombre('');
        setEdad('');
        setTelefono('');
        setCorreo('');
        return;
      }

      if (isEditar && id) {
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
      } else {
        if (!user?.email) return;

        const { data, error } = await supabase
          .from('usuarios')
          .select('nombre, edad, telefono, correo')
          .eq('correo', user.email)
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

    if (isNuevo) {
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
    } else if (isEditar && id) {
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre: nombre.trim(),
          edad: parseInt(edad) || null,
          telefono,
          ...(isAdmin ? { correo: correo.trim() } : {}),
        })
        .eq('id', id);

      if (error) {
        Alert.alert('Error', 'No se pudo actualizar el maestro');
      } else {
        Alert.alert('Éxito', 'Datos actualizados correctamente');
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
            {modo === 'editar'
              ? 'Editar maestro'
              : modo === 'nuevo'
              ? 'Nuevo maestro'
              : 'Información personal'}
          </Text>
        </View>

        {isAdmin && (modo === 'editar' || modo === 'nuevo') && (
          <TouchableOpacity className="mt-6" onPress={() => router.push('/admin')}>
            <View className="bg-gray-200 px-5 py-3 rounded-xl items-center">
              <Text className="text-red-800 font-semibold">← Volver al panel admin</Text>
            </View>
          </TouchableOpacity>
        )}

        <View className="mt-6 items-center">
          <Image source={images.avatar} className="w-32 h-32 rounded-full" />
        </View>

        <View className="mt-6">
          <Text className="text-gray-700 mb-1">Nombre</Text>
          <TextInput
            value={nombre}
            onChangeText={setNombre}
            className="border border-gray-300 rounded px-4 py-2"
            placeholder="Nombre completo"
          />
        </View>

        <View className="mt-4">
          <Text className="text-gray-700 mb-1">Edad</Text>
          <TextInput
            value={edad}
            onChangeText={setEdad}
            className="border border-gray-300 rounded px-4 py-2"
            placeholder="Edad"
            keyboardType="numeric"
          />
        </View>

        <View className="mt-4">
          <Text className="text-gray-700 mb-1">Teléfono</Text>
          <TextInput
            value={telefono}
            onChangeText={setTelefono}
            className="border border-gray-300 rounded px-4 py-2"
            placeholder="Teléfono"
            keyboardType="phone-pad"
          />
        </View>

        <View className="mt-4">
          <Text className="text-gray-700 mb-1">Correo</Text>
          <TextInput
            value={correo}
            editable={isAdmin === true && (modo === 'nuevo' || modo === 'editar')}
            onChangeText={setCorreo}
            className="border border-gray-300 rounded px-4 py-2"
            placeholder="Correo electrónico"
            keyboardType="email-address"
          />
        </View>

        <TouchableOpacity
          className="mt-8 bg-red-700 rounded-full py-3 items-center"
          onPress={handleGuardar}
        >
          <Text className="text-white font-semibold">Guardar</Text>
        </TouchableOpacity>

        <TouchableOpacity className="mt-6 items-center" onPress={handleLogout}>
          <Text className="text-red-700 font-semibold">Cerrar sesión</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
