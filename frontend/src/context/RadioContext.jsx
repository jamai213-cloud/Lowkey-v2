import { createContext, useContext } from 'react';
import useRadio from '../hooks/useRadio';

const RadioContext = createContext(null);

export const RadioProvider = ({ children }) => {
  const radio = useRadio();
  
  return (
    <RadioContext.Provider value={radio}>
      {children}
    </RadioContext.Provider>
  );
};

export const useRadioContext = () => {
  const context = useContext(RadioContext);
  if (!context) {
    throw new Error('useRadioContext must be used within a RadioProvider');
  }
  return context;
};

export default RadioContext;
