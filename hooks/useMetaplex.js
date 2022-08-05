import { createContext, useContext } from 'react';

const DEFAULT_CONTEXT = {
  metaplex: null,
};

export const MetaplexContext = createContext(DEFAULT_CONTEXT);

const useMetaplex = () => {
  return useContext(MetaplexContext);
}

export default useMetaplex;
