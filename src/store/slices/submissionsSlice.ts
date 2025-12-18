import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CommissionSubmission, SubmissionFilters } from '@/types';

interface SubmissionsState {
  submissions: CommissionSubmission[];
  currentSubmission: CommissionSubmission | null;
  filters: SubmissionFilters;
  isLoading: boolean;
  total: number;
  page: number;
  perPage: number;
}

const initialState: SubmissionsState = {
  submissions: [],
  currentSubmission: null,
  filters: {},
  isLoading: false,
  total: 0,
  page: 1,
  perPage: 20,
};

const submissionsSlice = createSlice({
  name: 'submissions',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setSubmissions: (state, action: PayloadAction<{ submissions: CommissionSubmission[]; total: number }>) => {
      state.submissions = action.payload.submissions;
      state.total = action.payload.total;
    },
    addSubmission: (state, action: PayloadAction<CommissionSubmission>) => {
      state.submissions.unshift(action.payload);
      state.total += 1;
    },
    updateSubmission: (state, action: PayloadAction<CommissionSubmission>) => {
      const index = state.submissions.findIndex(s => s.id === action.payload.id);
      if (index !== -1) {
        state.submissions[index] = action.payload;
      }
    },
    deleteSubmission: (state, action: PayloadAction<string>) => {
      state.submissions = state.submissions.filter(s => s.id !== action.payload);
      state.total -= 1;
    },
    setCurrentSubmission: (state, action: PayloadAction<CommissionSubmission | null>) => {
      state.currentSubmission = action.payload;
    },
    setFilters: (state, action: PayloadAction<SubmissionFilters>) => {
      state.filters = action.payload;
      state.page = 1; // Reset to first page when filters change
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.page = action.payload;
    },
  },
});

export const {
  setLoading,
  setSubmissions,
  addSubmission,
  updateSubmission,
  deleteSubmission,
  setCurrentSubmission,
  setFilters,
  setPage,
} = submissionsSlice.actions;
export default submissionsSlice.reducer;