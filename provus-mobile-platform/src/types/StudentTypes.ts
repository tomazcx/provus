export type StudentStackParamList = {
  StudentBase: undefined;
  TestSubmissionResult: {
    submissionData: {
      testName: string;
      professor: string;
      submissionTime: string;
      timeTaken: string;
      score: number;
      totalPoints: number;
      percentage: number;
      confirmationCode: string;
      questions: Array<{
        id: number;
        points: number;
        totalPoints: number;
        isCorrect: boolean;
      }>;
    };
  };
};