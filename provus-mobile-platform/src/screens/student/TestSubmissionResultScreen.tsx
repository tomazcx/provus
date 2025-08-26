import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Clipboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { StudentStackParamList } from '../../types/StudentTypes';

type Props = NativeStackScreenProps<StudentStackParamList, 'TestSubmissionResult'>;

const TestSubmissionResultScreen: React.FC<Props> = ({ navigation, route }) => {
  const { submissionData } = route.params;

  const copyToClipboard = () => {
    Clipboard.setString(submissionData.confirmationCode);
  };

  // Create test review data from submission data
  const mockTestReviewData = {
    testName: submissionData.testName,
    questions: submissionData.questions.map((question, index) => ({
      id: question.id,
      question: index === 0 ? "Qual é o resultado de 15 + 27?" : 
                index === 1 ? "A raiz quadrada de 144 é 12." :
                "Selecione todos os números primos da lista:",
      points: question.points,
      totalPoints: question.totalPoints,
      isCorrect: question.isCorrect,
      options: index === 0 ? [
        { text: "32 (Sua resposta)", isSelected: true, isCorrect: true },
        { text: "42", isSelected: false, isCorrect: false },
        { text: "52", isSelected: false, isCorrect: false },
        { text: "35", isSelected: false, isCorrect: false }
      ] : index === 1 ? [
        { text: "Verdadeiro (Sua resposta)", isSelected: true, isCorrect: true },
        { text: "Falso", isSelected: false, isCorrect: false }
      ] : [
        { text: "2 (Sua resposta)", isSelected: true, isCorrect: true },
        { text: "4 (Não selecionado)", isSelected: false, isCorrect: false },
        { text: "7 (Sua resposta)", isSelected: true, isCorrect: true },
        { text: "9 (Não selecionado)", isSelected: false, isCorrect: false }
      ],
      feedback: index === 0 ? "Excelente! Você realizou a adição corretamente." :
                index === 1 ? "Perfeito! √144 = 12 está correto." :
                "Boa resposta parcial, mas você perdeu alguns números primos na seleção."
    }))
  };

  const getQuestionStatusColor = (isCorrect: boolean, points: number, totalPoints: number) => {
    if (isCorrect) return COLORS.success;
    if (points > 0) return COLORS.warning;
    return COLORS.danger;
  };

  const renderQuestionBreakdown = () => {
    return submissionData.questions.map((question, index) => (
      <View key={question.id} style={styles.questionRow}>
        <Text style={styles.questionNumber}>Questão {index + 1}</Text>
        <View style={styles.questionPoints}>
          <Text style={[styles.pointsText, { color: getQuestionStatusColor(question.isCorrect, question.points, question.totalPoints) }]}>
            {question.points}/{question.totalPoints} pontos
          </Text>
          <View style={[styles.statusDot, { backgroundColor: getQuestionStatusColor(question.isCorrect, question.points, question.totalPoints) }]} />
        </View>
      </View>
    ));
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.successHeader}>
            <View style={styles.successIcon}>
              <Icon name="check" size={24} color={COLORS.white} />
            </View>
            <Text style={styles.successTitle}>Teste Enviado com Sucesso!</Text>
            <Text style={styles.successSubtitle}>Suas respostas foram gravadas e salvas.</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Resumo do Teste</Text>
            
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Nome do Teste</Text>
                <Text style={styles.summaryValue}>{submissionData.testName}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Professor</Text>
                <Text style={styles.summaryValue}>{submissionData.professor}</Text>
              </View>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Horário de Envio</Text>
                <Text style={styles.summaryValue}>{submissionData.submissionTime}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryLabel}>Tempo Gasto</Text>
                <Text style={styles.summaryValue}>{submissionData.timeTaken}</Text>
              </View>
            </View>

            <View style={styles.scoreSection}>
              <Text style={styles.scoreLabel}>Sua Pontuação</Text>
              <Text style={styles.scoreValue}>{submissionData.score}/{submissionData.totalPoints}</Text>
              <Text style={styles.scorePercentage}>{submissionData.percentage}% - Muito Bem!</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${submissionData.percentage}%` }]} />
              </View>
            </View>
          </View>

          <View style={styles.confirmationCard}>
            <View style={styles.confirmationHeader}>
              <Icon name="shield" size={16} color={COLORS.white} />
              <Text style={styles.confirmationTitle}>Código de Confirmação de Envio</Text>
            </View>
            <Text style={styles.confirmationSubtitle}>Apresente este código ao seu professor</Text>
            <View style={styles.codeContainer}>
              <Text style={styles.confirmationCode}>{submissionData.confirmationCode}</Text>
            </View>
            <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
              <Icon name="copy" size={16} color={COLORS.secondary} />
              <Text style={styles.copyButtonText}>Copiar Código</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Detalhamento das Questões</Text>
            <View style={styles.questionsList}>
              {renderQuestionBreakdown()}
            </View>
          </View>

          <View style={styles.actionButtons}>
            <TouchableOpacity
                style={styles.reviewButton}
                onPress={() => navigation.navigate('TestReview', { testData: mockTestReviewData })}
            >
              <Icon name="eye" size={20} color={COLORS.white} />
              <Text style={styles.reviewButtonText}>Revisar Respostas</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={20} color={COLORS.secondary} />
              <Text style={styles.backButtonText}>Voltar ao Dashboard</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Icon name="info" size={16} color={COLORS.info} />
            <Text style={styles.footerText}>Seu professor receberá uma notificação sobre seu envio</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.secondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 40,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 30,
  },
  successIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: COLORS.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryItem: {
    flex: 1,
    marginRight: 10,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
  },
  scoreSection: {
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  scoreLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 8,
  },
  scoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: COLORS.success,
    marginBottom: 4,
  },
  scorePercentage: {
    fontSize: 16,
    color: COLORS.success,
    fontWeight: '600',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: 4,
  },
  confirmationCard: {
    backgroundColor: COLORS.secondary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  confirmationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  confirmationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.white,
    marginLeft: 8,
  },
  confirmationSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
    marginBottom: 16,
  },
  codeContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  confirmationCode: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
    fontFamily: 'monospace',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: 12,
  },
  copyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },
  questionsList: {
    marginTop: 8,
  },
  questionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.warningBackground,
  },
  questionNumber: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
  },
  questionPoints: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pointsText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  actionButtons: {
    marginBottom: 20,
  },
  reviewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  reviewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.secondary,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
    marginLeft: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  footerText: {
    fontSize: 12,
    color: COLORS.white,
    opacity: 0.8,
    marginLeft: 8,
    textAlign: 'center',
  },
});

export default TestSubmissionResultScreen;