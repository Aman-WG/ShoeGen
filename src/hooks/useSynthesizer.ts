import { useReducer, useCallback } from 'react';
import { PHASE, type Phase } from '../constants/phases';
import type { ShoeGenerationResult } from '../engine/types';

export interface GenerationError {
  source: 'ai' | 'fallback';
  error?: string;
}

interface SynthesizerState {
  phase: Phase;
  prompt: string | null;
  selectedStyle: string | null;
  shoeResult: ShoeGenerationResult | null;
  generationError: GenerationError | null;
  isShaking: boolean;
}

const initialState: SynthesizerState = {
  phase: PHASE.IDLE,
  prompt: null,
  selectedStyle: null,
  shoeResult: null,
  generationError: null,
  isShaking: false,
};

type Action =
  | { type: 'SET_PHASE'; payload: Phase }
  | { type: 'SET_PROMPT'; payload: string }
  | { type: 'SET_SELECTED_STYLE'; payload: string }
  | { type: 'SET_SHOE_RESULT'; payload: ShoeGenerationResult | null }
  | { type: 'SET_GENERATION_ERROR'; payload: GenerationError | null }
  | { type: 'SET_SHAKING'; payload: boolean }
  | { type: 'RESET' };

function reducer(state: SynthesizerState, action: Action): SynthesizerState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.payload };
    case 'SET_PROMPT':
      return { ...state, prompt: action.payload };
    case 'SET_SELECTED_STYLE':
      return { ...state, selectedStyle: action.payload };
    case 'SET_SHOE_RESULT':
      return { ...state, shoeResult: action.payload };
    case 'SET_GENERATION_ERROR':
      return { ...state, generationError: action.payload };
    case 'SET_SHAKING':
      return { ...state, isShaking: action.payload };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useSynthesizer() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return {
    ...state,
    setPhase: useCallback((p: Phase) => dispatch({ type: 'SET_PHASE', payload: p }), []),
    setPrompt: useCallback((v: string) => dispatch({ type: 'SET_PROMPT', payload: v }), []),
    setSelectedStyle: useCallback((v: string) => dispatch({ type: 'SET_SELECTED_STYLE', payload: v }), []),
    setShoeResult: useCallback((r: ShoeGenerationResult | null) => dispatch({ type: 'SET_SHOE_RESULT', payload: r }), []),
    setGenerationError: useCallback((e: GenerationError | null) => dispatch({ type: 'SET_GENERATION_ERROR', payload: e }), []),
    setShaking: useCallback((v: boolean) => dispatch({ type: 'SET_SHAKING', payload: v }), []),
    reset: useCallback(() => dispatch({ type: 'RESET' }), []),
  };
}
