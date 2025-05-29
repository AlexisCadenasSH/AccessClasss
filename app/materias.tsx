import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { supabase } from '@/utils/supabase';

const Materias = () => {
  const { id_especialidad, nombre } = useLocalSearchParams<{
    id_especialidad: string;
    nombre: string;
  }>();

  const [materias, setMaterias] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevaMateria, setNuevaMateria] = useState('');

  const fetchMaterias = async () => {
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .eq('id_especialidad', id_especialidad);

    if (error) {
      console.error('Error al obtener materias:', error.message);
      return;
    }

    setMaterias(data);
  };

  useEffect(() => {
    fetchMaterias();
  }, []);

  const agregarMateria = async () => {
    if (!nuevaMateria.trim()) {
      Alert.alert('Error', 'El nombre no puede estar vacío');
      return;
    }

    const { data: existente } = await supabase
      .from('materias')
      .select('id')
      .eq('nombre', nuevaMateria.trim())
      .eq('id_especialidad', id_especialidad);

    if (existente && existente.length > 0) {
      Alert.alert('Ya existe una materia con ese nombre en esta especialidad');
      return;
    }

    const { error } = await supabase.from('materias').insert({
      nombre: nuevaMateria.trim(),
      id_especialidad: Number(id_especialidad),
    });

    if (error) {
      console.error('Error al agregar materia:', error.message);
      Alert.alert('Error al agregar materia');
    } else {
      setNuevaMateria('');
      setModalVisible(false);
      fetchMaterias();
    }
  };

  const eliminarMateria = async (id: number) => {
    Alert.alert(
      'Eliminar materia',
      '¿Estás seguro de eliminar esta materia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase
              .from('materias')
              .delete()
              .eq('id', id);

            if (error) {
              console.error('Error al eliminar materia:', error.message);
              Alert.alert('Error al eliminar');
            } else {
              fetchMaterias();
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="px-6 pt-10 bg-white h-full">
      <View className="flex-row items-center justify-between mb-6">
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
          <Text className="text-white font-semibold">Agregar materia</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-2xl font-bold text-red-700 mb-4 text-center">
        Materias de {nombre}
      </Text>

      {materias.length === 0 ? (
        <Text className="text-center text-gray-500">No hay materias aún</Text>
      ) : (
        materias.map((materia) => (
          <View
            key={materia.id}
            className="flex-row justify-between items-center bg-gray-100 px-4 py-3 mb-3 rounded-xl border border-red-300"
          >
            <Text className="text-lg text-red-800 font-semibold flex-1">
              {materia.nombre}
            </Text>
            <TouchableOpacity onPress={() => eliminarMateria(materia.id)}>
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
              Nueva materia
            </Text>
            <TextInput
              value={nuevaMateria}
              onChangeText={setNuevaMateria}
              placeholder="Nombre de la materia"
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
                onPress={agregarMateria}
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

export default Materias;
