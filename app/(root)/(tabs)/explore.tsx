import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { View, Text, Button, StyleSheet, TouchableOpacity, Platform, StatusBar, Alert } from 'react-native';
import { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/utils/supabase'; // Cliente de Supabase ya configurado

const Explore = () => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const codigoValido = 'cetis91';

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>Necesitamos tu permiso para acceder a la cámara</Text>
        <Button onPress={requestPermission} title="Conceder permiso" />
      </View>
    );
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  }

  const registrarAsistencia = async () => {
    

    const id_usuario = 1; // Sustituye con el ID real del maestro

    const fecha = new Date();

    // Obtener el día de la semana (0 = domingo, 1 = lunes, ..., 6 = sábado)
    const diasSemana = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    const dia = diasSemana[fecha.getDay()];
    // Obtener horas y minutos
    const horas = fecha.getHours();
    const minutos = fecha.getMinutes();

    // Formatear con dos dígitos
    const formatoDosDigitos = (num: number) => num.toString().padStart(2, '0');

    // Combinar en una sola variable
    const horaActual = `${formatoDosDigitos(horas)}:${formatoDosDigitos(minutos)}`;

    console.log(`dia y Hora actual:  ${dia} ${horaActual}`);////////hasta aqui funciona bien

    const { data: horarios, error: errorHorarios } = await supabase
      .from('horarios')
      .select('id, dia_semana, hora_inicio, id_materia_usuario')
      .eq('dia_semana', dia)
      .order('hora_inicio', { ascending: true });

    console.log("horarios hoy: ", horarios)

    if (errorHorarios || !horarios || horarios.length === 0) {
      Alert.alert('❌ Error', 'No se encontraron horarios para hoy.');
      return;
    }

    // Convertimos la hora actual a minutos
    function timeToMinutes(t: string) {
      const [h, m, s] = t.split(':').map(Number);
      return h * 60 + m + s / 60;
    }

    var minutosActuales = timeToMinutes(horaActual);

    // Buscamos el horario más cercano a la hora actualppppppppppppppppppppppppppppppppp
    let horarioMasCercano = horarios[0];
    let menorDiferencia = Math.abs(timeToMinutes(horarios[0].hora_inicio) - minutosActuales);
    console.log("horario mas cercano", horarioMasCercano);
    console.log("el de menor diferencia", menorDiferencia);

    for (let i = 1; i < horarios.length; i++) {
      const minutos = timeToMinutes(horarios[i].hora_inicio );
      const diferencia = Math.abs(minutos - minutosActuales);

      if (diferencia < menorDiferencia) {
        menorDiferencia = diferencia;
        horarioMasCercano = horarios[i];
      }
    }
    const id_horario = horarioMasCercano.id; // Sustituye con el horario actual relacionado
    const { data: relacion, error: errorRelacion } = await supabase
      .from('horarios')
      .select('id, id_materia_usuario, materia_usuario(id, materia(id, nombre))')
      .eq('id', horarioMasCercano.id)
      .single();

    if (errorRelacion || !relacion) {
      Alert.alert('❌ Error', 'No se pudo encontrar la relación con la materia.');
      return;
    }

    // 2. Obtener el nombre de la materia

    const { data: existente, error: errorBusqueda } = await supabase
      .from('asistencias')
      .select('*')
      .eq('id_usuario', id_usuario)
      .eq('id_horario', id_horario)
      .eq('fecha', fecha)
      .single();

    if (errorBusqueda && errorBusqueda.code !== 'PGRST116') {
      console.error('Error al verificar asistencia existente:', errorBusqueda);
      Alert.alert('❌ Error', 'No se pudo verificar la asistencia.');
      return;
    }

    if (existente) {
      // Ya existe entrada → Confirmar salida
      Alert.alert(
        '¿Registrar salida?',
        "Ya registraste tu entrada hoy a las ${existente.escaneo_inicio}. ¿Deseas registrar tu salida ahora?",
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Registrar salida',
            onPress: async () => {
              const { error: errorUpdate } = await supabase
                .from('asistencias')
                .update({ escaneo_fin: horaActual })
                .eq('id', existente.id);

              if (errorUpdate) {
                console.error('Error al registrar salida:', errorUpdate);
                Alert.alert('❌ Error', 'No se pudo registrar la salida.');
              } else {
                Alert.alert('✅ Salida registrada', 'Hora de salida guardada exitosamente.');
              }
            },
          },
        ]
      );
    } else {
      // No hay registro → Confirmar entrada
        Alert.alert(
        'Confirmar asistencia',
        "¿Deseas registrar tu entrada para la materia: ${materia.nombre}?",
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Registrar entrada',
            onPress: async () => {
              const { error: errorInsert } = await supabase
                .from('asistencias')
                .insert([
                  {
                    id_usuario: id_usuario,
                    id_horario: id_horario,
                    fecha: fecha,
                    escaneo_inicio: horaActual,
                    asistencia: true,
                  },
                ]);

              if (errorInsert) {
                console.error('Error al registrar entrada:', errorInsert);
                Alert.alert('❌ Error', 'No se pudo registrar la entrada.');
              } else {
                Alert.alert('✅ Entrada registrada', 'Hora de entrada guardada exitosamente.');
              }
            },
          },
        ]
      );
    }
  };

  function handleBarcodeScanned({ data }: { data: string }) {
    if (!scanned) {
      setScanned(true);

      if (data === codigoValido) {
        registrarAsistencia();
      } else {
        Alert.alert('❌ Código no válido', 'Por favor, escanea un código válido.');
      }

      setTimeout(() => {
        setScanned(false);
      }, 3000);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {Platform.OS === 'android' ? <StatusBar hidden /> : null}

      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        <View style={styles.overlayTop}>
          <Text style={styles.qrText}>Escanea un código QR...</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
          <Text style={styles.text}>🔄</Text>
        </TouchableOpacity>
      </CameraView>
    </SafeAreaView>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    fontSize: 16,
    color: 'black',
  },
  camera: {
    flex: 1,
  },
  button: {
    position: 'absolute',
    bottom: 60,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    borderRadius: 50,
    zIndex: 10,
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  overlayTop: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  qrText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
  },
});