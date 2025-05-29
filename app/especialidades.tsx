import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';


const Especialidades = () => {
  const [especialidades, setEspecialidades] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaEspecialidad, setNuevaEspecialidad] = useState('');

  const fetchEspecialidades = async () => {
    const { data, error } = await supabase.from('especialidades').select('*');

    if (error) {
      console.error('Error al obtener especialidades:', error.message);
    } else {
      setEspecialidades(data);
    }
  };

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  const agregarEspecialidad = async () => {
    const nombre = nuevaEspecialidad.trim();

    if (!nombre) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    const { data: existente } = await supabase
      .from('especialidades')
      .select('id')
      .eq('nombre', nombre);

    if (existente && existente.length > 0) {
      Alert.alert('Esa especialidad ya existe');
      return;
    }

    const { error } = await supabase
      .from('especialidades')
      .insert({ nombre });

    if (error) {
      console.error('Error al agregar especialidad:', error.message);
      Alert.alert('Error al agregar');
    } else {
      setNuevaEspecialidad('');
      setModalVisible(false);
      fetchEspecialidades();
    }
  };

  const eliminarEspecialidad = async (id: number) => {
    Alert.alert(
      'Eliminar especialidad',
      '¿Estás seguro de eliminar esta especialidad?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('especialidades')
              .delete()
              .eq('id', id);

            if (error) {
              console.error('Error al eliminar especialidad:', error.message);
              Alert.alert('Error al eliminar');
            } else {
              fetchEspecialidades();
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="px-6 pt-10 bg-white h-full">
      <View className="flex-row justify-between items-center mb-6">
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-gray-200 px-4 py-2 rounded-full"
        >
          <Text className="text-gray-700 font-medium">← Volver</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="bg-red-600 px-4 py-2 rounded-full flex-row items-center gap-2"
        >
          <Text className="text-white font-semibold">Agregar especialidad</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-2xl font-bold text-red-700 mb-4 text-center">
        Especialidades
      </Text>

      {especialidades.length === 0 ? (
        <Text className="text-center text-gray-500">
          No hay especialidades aún
        </Text>
      ) : (
        especialidades.map((esp) => (
          <View
            key={esp.id}
            className="flex-row justify-between items-center bg-gray-100 px-4 py-3 mb-3 rounded-xl border border-red-300"
          >
            <TouchableOpacity
              onPress={() =>
                router.push(
                  `/materias?id_especialidad=${esp.id}&nombre=${encodeURIComponent(
                    esp.nombre
                  )}`
                )
              }
              className="flex-1"
            >
              <Text className="text-lg text-red-800 font-semibold">
                {esp.nombre}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => eliminarEspecialidad(esp.id)}>
              <Text className="text-red-600 font-bold text-lg">X</Text>
            </TouchableOpacity>
          </View>
        ))
      )}

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/40 px-6">
          <View className="bg-white w-full rounded-xl p-6">
            <Text className="text-xl font-bold text-red-700 mb-4">
              Nueva especialidad
            </Text>
            <TextInput
              value={nuevaEspecialidad}
              onChangeText={setNuevaEspecialidad}
              placeholder="Nombre de la especialidad"
              className="border border-gray-300 rounded-lg px-4 py-2 mb-4"
            />
            <View className="flex-row justify-end gap-4">
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                className="bg-gray-300 px-4 py-2 rounded-lg"
              >
                <Text className="text-gray-700 font-semibold">Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={agregarEspecialidad}
                className="bg-red-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-semibold">Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default Especialidades;
