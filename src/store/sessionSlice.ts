import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getDefaultSessionState } from '@/lib/sessionDefaults';
import type { SessionState, ModuleProgress, PracticeSession } from '@/types';

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
    const data = await response.json();
    return data.state as SessionState;
  }
);

export const saveSessionState = createAsyncThunk(
  'session/save',
  async (updates: Partial<SessionState>) => {
    const response = await fetch('/api/state', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    });
    const data = await response.json();
    return data.state as SessionState;
  }
);

export const updateModuleProgress = createAsyncThunk(
  'session/updateModule',
  async ({ module, updates }: { module: string; updates: Partial<ModuleProgress> }) => {
    const response = await fetch(`/api/progress/${module}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    });
    const data = await response.json();
    return { module, data: data.data };
  }
);

export const recordLessonVisit = createAsyncThunk(
  'session/lessonVisit',
  async (lesson: string) => {
    const response = await fetch('/api/lesson/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lesson }),
    });
    const data = await response.json();
    return data.lessonsVisited as string[];
  }
);

export const recordPracticeSession = createAsyncThunk(
  'session/practiceRecord',
  async ({ correct, total, type }: { correct: number; total: number; type: string }) => {
    const response = await fetch('/api/practice/record', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correct, total, type }),
    });
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
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stars }),
    });
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
    updatePractice: (state, action: PayloadAction<Partial<typeof initialState.practice>>) => {
      state.practice = { ...state.practice, ...action.payload };
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
      .addCase(recordLessonVisit.fulfilled, (state, action) => {
        state.lessonsVisited = action.payload;
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
  updatePractice,
  addPracticeSession,
  setTotalStars,
  addAchievement,
} = sessionSlice.actions;

export default sessionSlice.reducer;
