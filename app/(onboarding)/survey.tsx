import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useOnboarding } from '@/components/providers/OnboardingProvider';
import { ProgressBar } from '@/components/onboarding/ProgressBar';
import { Survey as SurveyComponent } from '@/components/onboarding/Survey';
import { frenchSurveyQuestions } from '@/constants/onboardingQuestions';

const ONBOARDING_STEPS = [
  'welcome',
  'survey',
  'voice-recording',
  'editorial-profile',
  'features',
  'trial-offer',
  'subscription',
  'success',
];

export default function SurveyScreen() {
  const { nextStep, markStepCompleted, setSurveyAnswer, surveyAnswers } =
    useOnboarding();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [allQuestionsAnswered, setAllQuestionsAnswered] = useState(false);

  // Check if all questions have been answered
  useEffect(() => {
    const answered = frenchSurveyQuestions.every(
      (question) => surveyAnswers[question.id]
    );
    setAllQuestionsAnswered(answered);
  }, [surveyAnswers]);

  const handleAnswer = (optionId: string) => {
    const currentQuestion = frenchSurveyQuestions[currentQuestionIndex];
    setSurveyAnswer(currentQuestion.id, optionId);
  };

  const handleContinue = () => {
    if (currentQuestionIndex < frenchSurveyQuestions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, move to next step
      markStepCompleted('survey');
      nextStep();
    }
  };

  const currentQuestion = frenchSurveyQuestions[currentQuestionIndex];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ProgressBar
        steps={ONBOARDING_STEPS}
        currentStep="survey"
        completedSteps={['welcome']}
      />

      <View style={styles.header}>
        <Text style={styles.title}>Questionnaire rapide</Text>
        <Text style={styles.subtitle}>
          Aidez-nous à personnaliser votre expérience
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.questionContainer}>
          <Text style={styles.progress}>
            Question {currentQuestionIndex + 1} sur{' '}
            {frenchSurveyQuestions.length}
          </Text>

          <SurveyComponent
            question={currentQuestion.question}
            options={currentQuestion.options}
            onAnswer={handleAnswer}
            selectedOption={surveyAnswers[currentQuestion.id]}
            onContinue={handleContinue}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  questionContainer: {
    flex: 1,
    padding: 20,
  },
  progress: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
  },
});
