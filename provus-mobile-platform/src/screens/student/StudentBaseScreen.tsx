import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { COLORS } from '../../constants/colors';
import { mockSubmissionResponse } from '../../mock/mockSubmissionResponse';
import { mockAvaliacao } from '../../mock/mockAvaliacao';
import { StudentStackParamList } from '../../types/StudentTypes';

type Props = NativeStackScreenProps<StudentStackParamList, 'StudentBase'>;

const StudentBaseScreen: React.FC<Props> = ({ navigation }) => {
  const firstSubmission = mockSubmissionResponse.submissoes[0];
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Data não disponível';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateTimeTaken = (start?: string, end?: string) => {
    if (!start || !end) return 'Tempo não disponível';
    const startTime = new Date(start);
    const endTime = new Date(end);
    const diffMs = endTime.getTime() - startTime.getTime();
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes} minutos ${seconds} segundos`;
  };

  const mockSubmissionData = {
    testName: mockSubmissionResponse.titulo,
    professor: 'Prof. Silva',
    submissionTime: formatDate(firstSubmission.finalizadoEm),
    timeTaken: calculateTimeTaken(firstSubmission.iniciadoEm, firstSubmission.finalizadoEm),
    score: firstSubmission.pontuacaoTotal,
    totalPoints: mockSubmissionResponse.pontuacaoTotal,
    percentage: Math.round((firstSubmission.pontuacaoTotal / mockSubmissionResponse.pontuacaoTotal) * 100),
    confirmationCode: `TST-${mockSubmissionResponse.applicationId}-${firstSubmission.id}-${new Date().getFullYear()}`,
    questions: mockAvaliacao.questoes?.map((questao, index) => ({
      id: questao.id,
      points: index < 2 ? questao.pontuacao : Math.floor(questao.pontuacao * 0.7),
      totalPoints: questao.pontuacao,
      isCorrect: index < 2,
    })) || [],
  };

  // TODO: Remove this temporary navigation function after implementing proper student flow
  const navigateToTestResult = () => {
    navigation.navigate('TestSubmissionResult', { submissionData: mockSubmissionData });
  };
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Estudante tela inicial teste ajeitar depois</Text>

        {/* TODO: Remove this temporary test button after implementing proper student flow */}
        <TouchableOpacity style={styles.testButton} onPress={navigateToTestResult}>
          <Text style={styles.testButtonText}>Ver Resultado do Teste (TEMP)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.info,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  testButton: {
    backgroundColor: COLORS.info,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  testButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default StudentBaseScreen;