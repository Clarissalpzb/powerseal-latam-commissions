import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import submissionsSlice from './slices/submissionsSlice';

// Middleware to save submissions to localStorage
const localStorageMiddleware = (store: any) => (next: any) => (action: any) => {
  const result = next(action);
  
  // Save submissions to localStorage when they change
  if (action.type?.startsWith('submissions/')) {
    const state = store.getState();
    localStorage.setItem('commissionhub_submissions', JSON.stringify(state.submissions.submissions));
  }
  
  return result;
};

// Load submissions from localStorage
const loadSubmissionsFromStorage = () => {
  try {
    const savedSubmissions = localStorage.getItem('commissionhub_submissions');
    if (savedSubmissions) {
      const parsed = JSON.parse(savedSubmissions);
      return parsed || [];
    }
    return [];
  } catch (error) {
    console.error('Error loading submissions from localStorage:', error);
    return [];
  }
};

export const store = configureStore({
  reducer: {
    auth: authSlice,
    submissions: submissionsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(localStorageMiddleware),
  preloadedState: {
    submissions: {
      submissions: loadSubmissionsFromStorage(),
      currentSubmission: null,
      filters: {},
      isLoading: false,
      total: loadSubmissionsFromStorage().length,
      page: 1,
      perPage: 20,
    },
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;