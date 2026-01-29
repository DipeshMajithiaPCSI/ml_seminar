import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useGameStore = create(
  persist(
    (set, get) => ({
      // Current page/experiment index
      currentPage: 0,
      
      // Completed experiments
      completedExperiments: [],
      
      // Scores per experiment
      scores: {},
      
      // User progress data for each game
      gameData: {},
      
      // Actions
      setCurrentPage: (page) => set({ currentPage: page }),
      
      nextPage: () => set((state) => ({ 
        currentPage: state.currentPage + 1 
      })),
      
      previousPage: () => set((state) => ({ 
        currentPage: Math.max(0, state.currentPage - 1) 
      })),
      
      completeExperiment: (experimentId) => set((state) => ({
        completedExperiments: state.completedExperiments.includes(experimentId)
          ? state.completedExperiments
          : [...state.completedExperiments, experimentId]
      })),
      
      setScore: (experimentId, score) => set((state) => ({
        scores: { ...state.scores, [experimentId]: score }
      })),
      
      setGameData: (experimentId, data) => set((state) => ({
        gameData: { ...state.gameData, [experimentId]: data }
      })),
      
      resetProgress: () => set({
        currentPage: 0,
        completedExperiments: [],
        scores: {},
        gameData: {}
      }),
      
      // Computed helpers
      isExperimentCompleted: (experimentId) => 
        get().completedExperiments.includes(experimentId),
      
      getScore: (experimentId) => 
        get().scores[experimentId] ?? null,
      
      getProgress: () => {
        const totalExperiments = 8
        return (get().completedExperiments.length / totalExperiments) * 100
      }
    }),
    {
      name: 'ai-seminar-progress',
    }
  )
)

export default useGameStore
