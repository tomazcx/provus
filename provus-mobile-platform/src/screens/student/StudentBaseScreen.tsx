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
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  iconContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -36,
    zIndex: 1,
    elevation: 10,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.white,
    padding: 24,
    paddingTop: 48,
    borderRadius: 20,
    elevation: 5,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 56,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: COLORS.textPrimary,
    padding: 0,
  },
  button: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    elevation: 3,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default IdentificationScreen;
