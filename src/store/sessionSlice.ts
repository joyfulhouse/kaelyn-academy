import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getDefaultSessionState } from '@/lib/sessionDefaults';
import { withCsrf } from '@/lib/csrfClient';
import type { SessionState, ModuleProgress, PracticeSession, SightWordsProgress, LettersProgress, PhonicsProgress } from '@/types';

type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

interface SessionSliceState extends SessionState {
  status: LoadingStatus;
  error: string | null;
}

const initialState: SessionSliceState = {
  status: 'idle',
  error: null,
  ...getDefaultSessionState(),
};

// Async thunks for API calls
export const loadSessionState = createAsyncThunk(
  'session/load',
  async () => {
    const response = await fetch('/api/state');
    if (!response.ok) {
      throw new Error(`Failed to load session: ${response.status}`);
    }
    const data = await response.json();
    return data.state as SessionState;
  }
);

export const saveSessionState = createAsyncThunk(
  'session/save',
  async (updates: Partial<SessionState>) => {
    const response = await fetch('/api/state', {
      method: 'POST',
      headers: withCsrf({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`Failed to save session: ${response.status}`);
    }
    const data = await response.json();
    return data.state as SessionState;
  }
);

export const updateModuleProgress = createAsyncThunk(
  'session/updateModule',
  async ({ module, updates }: { module: string; updates: Partial<ModuleProgress> }) => {
    const response = await fetch(`/api/progress/${module}`, {
      method: 'POST',
      headers: withCsrf({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(updates),
    });
    if (!response.ok) {
      throw new Error(`Failed to update module progress: ${response.status}`);
    }
    const data = await response.json();
    return { module, data: data.data };
  }
);

export const recordPracticeSession = createAsyncThunk(
  'session/practiceRecord',
  async ({ correct, total, type }: { correct: number; total: number; type: string }) => {
    const response = await fetch('/api/practice/record', {
      method: 'POST',
      headers: withCsrf({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ correct, total, type }),
    });
    if (!response.ok) {
      throw new Error(`Failed to record practice session: ${response.status}`);
    }
    const data = await response.json();
    return {
      practice: data.practice,
      starsEarned: data.starsEarned,
      totalStars: data.totalStars,
    };
  }
);

export const addStars = createAsyncThunk(
  'session/addStars',
  async (stars: number) => {
    const response = await fetch('/api/stars/add', {
      method: 'POST',
      headers: withCsrf({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ stars }),
    });
    if (!response.ok) {
      throw new Error(`Failed to add stars: ${response.status}`);
    }
    const data = await response.json();
    return data.totalStars as number;
  }
);

const sessionSlice = createSlice({
  name: 'session',
  initialState,
  reducers: {
    setUserName: (state, action: PayloadAction<string>) => {
      state.userName = action.payload;
    },
    addLessonVisited: (state, action: PayloadAction<string>) => {
      if (!state.lessonsVisited.includes(action.payload)) {
        state.lessonsVisited.push(action.payload);
      }
    },
    addLessonCompleted: (state, action: PayloadAction<string>) => {
      if (!state.lessonsCompleted.includes(action.payload)) {
        state.lessonsCompleted.push(action.payload);
      }
    },
    updateNumberPlaces: (state, action: PayloadAction<Partial<typeof initialState.numberPlaces>>) => {
      state.numberPlaces = { ...state.numberPlaces, ...action.payload };
    },
    updateStackedMath: (state, action: PayloadAction<Partial<typeof initialState.stackedMath>>) => {
      state.stackedMath = { ...state.stackedMath, ...action.payload };
    },
    updateMultiplication: (state, action: PayloadAction<Partial<typeof initialState.multiplication>>) => {
      state.multiplication = { ...state.multiplication, ...action.payload };
    },
    updateDivision: (state, action: PayloadAction<Partial<ModuleProgress>>) => {
      state.division = { ...state.division, ...action.payload };
    },
    updateCarryOver: (state, action: PayloadAction<Partial<ModuleProgress>>) => {
      state.carryOver = { ...state.carryOver, ...action.payload };
    },
    updateBorrowing: (state, action: PayloadAction<Partial<ModuleProgress>>) => {
      state.borrowing = { ...state.borrowing, ...action.payload };
    },
    updateSetsPairs: (state, action: PayloadAction<Partial<ModuleProgress>>) => {
      state.setsPairs = { ...state.setsPairs, ...action.payload };
    },
    updatePractice: (state, action: PayloadAction<Partial<typeof initialState.practice>>) => {
      state.practice = { ...state.practice, ...action.payload };
    },
    // Reading progress reducers
    updateSightWords: (state, action: PayloadAction<Partial<SightWordsProgress>>) => {
      state.sightWords = { ...state.sightWords, ...action.payload };
    },
    updateLetters: (state, action: PayloadAction<Partial<LettersProgress>>) => {
      state.letters = { ...state.letters, ...action.payload };
    },
    addWordLearned: (state, action: PayloadAction<string>) => {
      if (!state.sightWords.wordsLearned.includes(action.payload)) {
        state.sightWords.wordsLearned.push(action.payload);
      }
    },
    addLetterLearned: (state, action: PayloadAction<string>) => {
      if (!state.letters.lettersLearned.includes(action.payload)) {
        state.letters.lettersLearned.push(action.payload);
      }
    },
    // Phonics progress reducers
    updatePhonics: (state, action: PayloadAction<Partial<PhonicsProgress>>) => {
      state.phonics = { ...state.phonics, ...action.payload };
    },
    addPhonemeLearned: (state, action: PayloadAction<string>) => {
      if (!state.phonics.phonemesLearned.includes(action.payload)) {
        state.phonics.phonemesLearned.push(action.payload);
      }
    },
    addWordBlended: (state, action: PayloadAction<string>) => {
      if (!state.phonics.wordsBlended.includes(action.payload)) {
        state.phonics.wordsBlended.push(action.payload);
      }
    },
    markPhonicsUnitComplete: (state, action: PayloadAction<number>) => {
      if (!state.phonics.unitsCompleted.includes(action.payload)) {
        state.phonics.unitsCompleted.push(action.payload);
      }
    },
    addPracticeSession: (state, action: PayloadAction<PracticeSession>) => {
      state.practice.recentScores.unshift(action.payload);
      if (state.practice.recentScores.length > 10) {
        state.practice.recentScores.pop();
      }
      state.practice.totalSessions += 1;
      state.practice.totalProblems += action.payload.total;
      state.practice.totalCorrect += action.payload.score;
      if (action.payload.score > state.practice.bestScore) {
        state.practice.bestScore = action.payload.score;
      }
    },
    setTotalStars: (state, action: PayloadAction<number>) => {
      state.totalStars = action.payload;
    },
    addAchievement: (state, action: PayloadAction<string>) => {
      if (!state.achievements.includes(action.payload)) {
        state.achievements.push(action.payload);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSessionState.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(loadSessionState.fulfilled, (state, action) => {
        return { ...state, ...action.payload, status: 'succeeded' as const, error: null };
      })
      .addCase(loadSessionState.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message ?? 'Failed to load session';
      })
      .addCase(saveSessionState.fulfilled, (state, action) => {
        return { ...state, ...action.payload, status: state.status, error: state.error };
      })
      .addCase(recordPracticeSession.fulfilled, (state, action) => {
        state.practice = action.payload.practice;
        state.totalStars = action.payload.totalStars;
      })
      .addCase(addStars.fulfilled, (state, action) => {
        state.totalStars = action.payload;
      });
  },
});

export const {
  setUserName,
  addLessonVisited,
  addLessonCompleted,
  updateNumberPlaces,
  updateStackedMath,
  updateMultiplication,
  updateDivision,
  updateCarryOver,
  updateBorrowing,
  updateSetsPairs,
  updatePractice,
  updateSightWords,
  updateLetters,
  addWordLearned,
  addLetterLearned,
  updatePhonics,
  addPhonemeLearned,
  addWordBlended,
  markPhonicsUnitComplete,
  addPracticeSession,
  setTotalStars,
  addAchievement,
} = sessionSlice.actions;

export default sessionSlice.reducer;
