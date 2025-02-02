import { createContext, useContext, useState, ReactNode } from 'react';

interface ApiContextType {
  apiCallCount: number;
  incrementApiCallCount: () => void;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export function ApiProvider({ children }: { children: ReactNode }) {
  const [apiCallCount, setApiCallCount] = useState(0);

  const incrementApiCallCount = () => {
    setApiCallCount(prev => prev + 1);
  };

  return (
    <ApiContext.Provider value={{ apiCallCount, incrementApiCallCount }}>
      {children}
    </ApiContext.Provider>
  );
}

export function useApiCounter() {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApiCounter must be used within an ApiProvider');
  }
  return context;
}
