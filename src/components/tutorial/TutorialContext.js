import { createContext, useContext } from 'react';
export const TutorialContext = createContext(null);
export const useTutorialLily = () => useContext(TutorialContext);
