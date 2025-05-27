import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  SafeAreaView,
} from 'react-native';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router'; // Import necesario

interface Maestro {
  id: string;
  nombre: string;
  correo: string;
}

const Admin = () => {
  const [maestros, setMaestros] = useState<Maestro[]>([]);

  const fetchMaestros = async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, nombre, correo')
      .eq('es_admin', false)
      .order('nombre', { ascending: true });

    if (error) {
      console.error('Error al obtener maestros:', error.message);
      Alert.alert('Error', 'No se pudo cargar la lista de maestros');
      return;
    }

    setMaestros(data as Maestro[]);
  };

  useEffect(() => {
    fetchMaestros();
  }, []);

  const handleMaestroPress = (maestro: Maestro) => {
    router.push(`/profile?id=${maestro.id}&modo=editar`);
    };


  const handleEliminarMaestro = async (id: string) => {
    Alert.alert(
      'Eliminar maestro',
      '¿Estás seguro de que deseas eliminar este maestro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('usuarios')
              .delete()
              .eq('id', id);

            if (error) {
              console.error('Error al eliminar maestro:', error.message);
              Alert.alert('Error', 'No se pudo eliminar el maestro');
              return;
            }

            fetchMaestros(); // Refresca la lista
            Alert.alert('Éxito', 'Maestro eliminado correctamente');
          },
        },
      ]
    );
  };

  const handleAgregarMaestro = () => {
    router.push('/profile?modo=nuevo');
  };

  return (
    <SafeAreaView className="h-full bg-white">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerClassName="pb-10 px-6">

        <View className="items-center mt-6">
          <Text className="text-3xl font-bold text-red-800">Panel</Text>
          <Text className="text-xl font-semibold text-red-800 -mt-2">Administrador</Text>
        </View>

        <View className="items-center mt-4 mb-2">
          <Text className="bg-red-700 text-white px-4 py-2 rounded-full font-semibold">
            Lista de Maestros
          </Text>
        </View>

        <View className="mt-6 gap-4">
          {maestros.length === 0 ? (
            <Text className="text-center text-gray-500">No hay maestros registrados</Text>
          ) : (
            maestros.map((maestro) => (
              <View
                key={maestro.id}
                className="flex-row items-center justify-between bg-white/80 px-4 py-3 rounded-xl shadow border border-red-300"
              >
                <TouchableOpacity
                  onPress={() => handleMaestroPress(maestro)}
                  className="flex-1"
                >
                  <Text className="text-lg font-semibold text-red-800 text-center">
                    {maestro.nombre}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleEliminarMaestro(maestro.id)}
                  className="ml-3 px-2 py-1"
                >
                  <Text className="text-red-600 text-xl font-bold">X</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View className="mt-10 items-center">
          <TouchableOpacity
            onPress={handleAgregarMaestro}
            className="bg-red-600 px-6 py-3 rounded-full shadow"
          >
            <Text className="text-white font-bold text-lg">Agregar maestro</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Admin;
