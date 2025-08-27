import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  KeyboardAvoidingView,
} from 'react-native';

import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../../constants/colors';
import { StudentStackParamList } from '../../types/StudentTypes';

type Props = NativeStackScreenProps<StudentStackParamList, 'StudentBase'>;

const IdentificationScreen: React.FC<Props> = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [assessmentCode, setAssessmentCode] = useState('');

  const handleVerifyIdentity = () => {
    if (!fullName || !email || !assessmentCode) {
      Alert.alert('Campos incompletos', 'Por favor, preencha todos os campos.');
      return;
    }
    console.log({ fullName, email, assessmentCode });
    Alert.alert(
      'Identidade Verificada',
      'Você será redirecionado para a avaliação.',
    );
  };

  return (
    <LinearGradient
      colors={['#E9F7F9', COLORS.background]}
      style={styles.gradient}
    >
      <StatusBar barStyle="dark-content" backgroundColor={'#E9F7F9'} />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          contentContainerStyle={styles.scrollContainer}
          bounces={false}
        >
          <View style={styles.iconContainer}>
            <Icon name="award" size={28} color={COLORS.white} />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Identificação</Text>
            <Text style={styles.subtitle}>
              Insira seus dados para acessar a avaliação
            </Text>

            <Text style={styles.label}>Nome Completo *</Text>
            <View style={styles.inputContainer}>
              <Icon name="user" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="Digite seu nome completo"
                placeholderTextColor={COLORS.textSecondary}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>

            <Text style={styles.label}>E-mail *</Text>
            <View style={styles.inputContainer}>
              <Icon name="mail" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="seu.email@instituicao.edu"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />
            </View>

            <Text style={styles.label}>Código da Avaliação *</Text>
            <View style={styles.inputContainer}>
              <Icon name="hash" size={20} color={COLORS.textSecondary} />
              <TextInput
                style={styles.input}
                placeholder="000000"
                placeholderTextColor={COLORS.textSecondary}
                value={assessmentCode}
                onChangeText={setAssessmentCode}
                keyboardType="number-pad"
              />
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={handleVerifyIdentity}
            >
              <Icon name="check-circle" size={20} color={COLORS.white} />
              <Text style={styles.buttonText}>Verificar Identidade</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: { flex: 1 },
  scrollContainer: {},
  iconContainer: {},
  card: {},
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.secondary,
    textAlign: 'center',
  },
  subtitle: {},
  label: {},
  inputContainer: {},
  input: {},
  button: {},
  buttonText: {},
});

export default IdentificationScreen;
