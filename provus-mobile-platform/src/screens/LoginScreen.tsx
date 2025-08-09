import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Feather';

import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const COLORS = {
  backgroundGradient: ['#E0F7FA', '#FFFFFF'],
  white: '#fff',
  primary: '#192A56',
  textPrimary: '#2F3542',
  textSecondary: '#747D8C',
  border: '#D9DFE4',
  shadow: '#000',
};

type LoginScreenProps = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen = ({ navigation }: LoginScreenProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const passwordInputRef = useRef<TextInput>(null);

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert('Login inválido', 'Por favor, preencha todos os campos.');
      return;
    }
    navigation.navigate('Applications');
  };

  return (
    <LinearGradient colors={COLORS.backgroundGradient} style={styles.gradient}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={COLORS.backgroundGradient[0]}
      />
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          style={styles.keyboardAvoidingContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.lockIconContainer}>
            <Icon name="lock" size={28} color={COLORS.white} />
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Bem vindo de volta!</Text>

            <Text style={styles.label}>E-mail*</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="mail"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={COLORS.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => passwordInputRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            <Text style={styles.label}>Senha*</Text>
            <View style={styles.inputContainer}>
              <Icon
                name="lock"
                size={20}
                color={COLORS.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                ref={passwordInputRef}
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={COLORS.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!isPasswordVisible}
                returnKeyType="go"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setIsPasswordVisible(!isPasswordVisible)}
              >
                <Icon
                  name={isPasswordVisible ? 'eye-off' : 'eye'}
                  size={20}
                  color={COLORS.textSecondary}
                  style={styles.inputIcon}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Entrar</Text>
              <Icon name="arrow-right" size={20} color={COLORS.white} />
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
  keyboardAvoidingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  lockIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: -32,
    zIndex: 1,
    elevation: 10,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginBottom: 24,
    marginTop: 16,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginTop: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: COLORS.white,
  },
  inputIcon: { marginHorizontal: 8 },
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
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    elevation: 3,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
});

export default LoginScreen;
