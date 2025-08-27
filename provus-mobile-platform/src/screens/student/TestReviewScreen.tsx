import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Feather';
import { COLORS } from '../../constants/colors';
import { RootStackParamList } from '../../navigation/AppNavigator';
import studentMockDataService, { IStudentTestReview } from '../../services/studentMockDataService';

type Props = NativeStackScreenProps<RootStackParamList, 'TestReview'>;

const TestReviewScreen: React.FC<Props> = ({ navigation, route }) => {
  const { submissionId } = route.params;
  const [testData, setTestData] = useState<IStudentTestReview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [menuVisible, setMenuVisible] = useState(false);
  

  useEffect(() => {
    loadTestReview();
  }, [submissionId]);

  const loadTestReview = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentMockDataService.getTestReview(submissionId);
      setTestData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar revisão do teste');
    } finally {
      setLoading(false);
    }
  };

  const renderQuestionMenu = () => {
    if (!menuVisible) return null;
    
    return (
      <View style={styles.modalOverlay}>
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setMenuVisible(false)}
        >
          <TouchableOpacity style={styles.menuContainer} activeOpacity={1} onPress={() => {}}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Questões</Text>
              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Icon name="x" size={24} color={COLORS.secondary} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.questionsList}>
              {testData?.questions.map((question, index) => (
                <TouchableOpacity
                  key={question.id}
                  style={[
                    styles.questionMenuItem,
                    currentQuestion === index && styles.questionMenuItemActive
                  ]}
                  onPress={() => {
                    setCurrentQuestion(index);
                    setMenuVisible(false);
                  }}
                >
                  <View style={styles.questionMenuItemContent}>
                    <Text style={[
                      styles.questionMenuItemText,
                      currentQuestion === index && styles.questionMenuItemTextActive
                    ]}>
                      Questão {index + 1}
                    </Text>
                    <View style={[
                      styles.statusIndicator,
                      { backgroundColor: question.isCorrect ? COLORS.success : COLORS.danger }
                    ]}>
                      <Icon 
                        name={question.isCorrect ? "check" : "x"} 
                        size={12} 
                        color={COLORS.white} 
                      />
                    </View>
                  </View>
                  <Text style={styles.questionMenuScore}>
                    {question.points}/{question.totalPoints} pontos
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCurrentQuestion = () => {
    if (!testData) return null;
    const question = testData.questions[currentQuestion];
    if (!question) return null;

    return (
      <View style={styles.questionContainer}>
        <View style={styles.questionHeader}>
          <Text style={styles.questionTitle}>Questão {currentQuestion + 1}</Text>
          <View style={styles.questionStatus}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: question.isCorrect ? COLORS.success : COLORS.danger }
            ]}>
              <Icon 
                name={question.isCorrect ? "check" : "x"} 
                size={16} 
                color={COLORS.white} 
              />
              <Text style={styles.statusText}>
                {question.isCorrect ? 'Correto' : 'Errado'}
              </Text>
            </View>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>{question.points}/{question.totalPoints} pontos</Text>
            </View>
          </View>
        </View>

        <Text style={styles.questionText}>
          {question.question || `${currentQuestion + 1}: 15 + 27?`}
        </Text>

        <View style={styles.optionsContainer}>
          {question.options?.map((option, index) => (
            <View
              key={index}
              style={[
                styles.optionItem,
                option.isSelected && styles.selectedOption,
                option.isCorrect && styles.correctOption
              ]}
            >
              <View style={styles.optionContent}>
                <View style={[
                  styles.optionIndicator,
                  option.isSelected && styles.selectedIndicator,
                  option.isCorrect && styles.correctIndicator
                ]}>
                  {option.isCorrect && <Icon name="check" size={12} color={COLORS.white} />}
                  {option.isSelected && !option.isCorrect && <Icon name="x" size={12} color={COLORS.white} />}
                </View>
                <Text style={[
                  styles.optionText,
                  option.isSelected && styles.selectedOptionText,
                  option.isCorrect && styles.correctOptionText
                ]}>
                  {String.fromCharCode(65 + index)}) {option.text}
                </Text>
              </View>
              {option.isCorrect && (
                <Text style={styles.correctLabel}>Resposta correta</Text>
              )}
            </View>
          )) || (
            <>
              <View style={[styles.optionItem, styles.selectedOption]}>
                <View style={styles.optionContent}>
                  <View style={[styles.optionIndicator, styles.selectedIndicator]}>
                    <Icon name="check" size={12} color={COLORS.white} />
                  </View>
                  <Text style={[styles.optionText, styles.selectedOptionText]}>
                    A) 32 (Sua resposta)
                  </Text>
                </View>
                <Text style={styles.correctLabel}>Resposta correta</Text>
              </View>
              <View style={styles.optionItem}>
                <View style={styles.optionContent}>
                  <View style={styles.optionIndicator} />
                  <Text style={styles.optionText}>B) 42</Text>
                </View>
              </View>
              <View style={styles.optionItem}>
                <View style={styles.optionContent}>
                  <View style={styles.optionIndicator} />
                  <Text style={styles.optionText}>C) 52</Text>
                </View>
              </View>
              <View style={styles.optionItem}>
                <View style={styles.optionContent}>
                  <View style={styles.optionIndicator} />
                  <Text style={styles.optionText}>D) 35</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {question.feedback && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackTitle}>Feedback do professor:</Text>
            <Text style={styles.feedbackText}>{question.feedback}</Text>
          </View>
        )}

        <View style={styles.navigationButtons}>
          <TouchableOpacity
            style={[styles.navButton, currentQuestion === 0 && styles.navButtonDisabled]}
            onPress={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
          >
            <Icon name="chevron-left" size={20} color={COLORS.white} />
            <Text style={styles.navButtonText}>Anterior</Text>
          </TouchableOpacity>

          <Text style={styles.questionCounter}>
            {currentQuestion + 1} / {testData?.questions.length || 0}
          </Text>

          <TouchableOpacity
            style={[
              styles.navButton, 
              currentQuestion === (testData?.questions.length || 0) - 1 && styles.navButtonDisabled
            ]}
            onPress={() => setCurrentQuestion(Math.min((testData?.questions.length || 0) - 1, currentQuestion + 1))}
            disabled={currentQuestion === (testData?.questions.length || 0) - 1}
          >
            <Text style={styles.navButtonText}>Próximo</Text>
            <Icon name="chevron-right" size={20} color={COLORS.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.white} />
          <Text style={styles.loadingText}>Carregando revisão...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !testData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={COLORS.white} />
          <Text style={styles.errorText}>{error || 'Dados não encontrados'}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadTestReview}>
            <Text style={styles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => {
            setMenuVisible(!menuVisible);
          }}
        >
          <Icon name="menu" size={24} color={COLORS.white} />
        </TouchableOpacity>
        
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Resultados da avaliação</Text>
          <Text style={styles.headerSubtitle}>{testData.testName}</Text>
        </View>
      </View>

      <View style={styles.contentWrapper}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {renderCurrentQuestion()}
        </ScrollView>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('StudentBase')}
        >
          <Icon name="arrow-left" size={20} color={COLORS.white} />
          <Text style={styles.backButtonText}>Voltar ao Dashboard</Text>
        </TouchableOpacity>
      </View>

{renderQuestionMenu()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 80,
  },
  contentWrapper: {
    flex: 1,
  },
  menuButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.white,
    opacity: 0.8,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
    maxWidth: 100,
  },
  headerButtonText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.secondary,
    flexShrink: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  questionContainer: {
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
  questionHeader: {
    marginBottom: 16,
  },
  questionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
    marginBottom: 12,
  },
  questionStatus: {
    flexDirection: 'row',
    gap: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  scoreBadge: {
    backgroundColor: COLORS.info,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  questionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 24,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  optionItem: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 16,
  },
  selectedOption: {
    backgroundColor: '#FEF3E2',
    borderColor: COLORS.warning,
  },
  correctOption: {
    backgroundColor: '#F0F9F4',
    borderColor: COLORS.success,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    backgroundColor: COLORS.warning,
    borderColor: COLORS.warning,
  },
  correctIndicator: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.success,
  },
  optionText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    flex: 1,
  },
  selectedOptionText: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  correctOptionText: {
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  correctLabel: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '600',
    marginTop: 8,
  },
  feedbackContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
  },
  feedbackTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    marginBottom: 8,
  },
  feedbackText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  navigationButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  navButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.5,
  },
  navButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.white,
  },
  questionCounter: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    margin: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    justifyContent: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.white,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    zIndex: 1000,
  },
  menuContainer: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '70%',
  },
  menuHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  menuTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.secondary,
  },
  questionsList: {
    paddingHorizontal: 20,
  },
  questionMenuItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: COLORS.background,
  },
  questionMenuItemActive: {
    backgroundColor: COLORS.secondary,
  },
  questionMenuItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  questionMenuItemText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  questionMenuItemTextActive: {
    color: COLORS.white,
  },
  statusIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionMenuScore: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.white,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.white,
    textAlign: 'center',
    marginVertical: 16,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.secondary,
  },
});

export default TestReviewScreen;