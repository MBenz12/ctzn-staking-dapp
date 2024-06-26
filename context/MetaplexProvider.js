import { Metaplex, walletOrGuestIdentity } from '@metaplex-foundation/js';
import { MetaplexContext } from '../hooks/useMetaplex';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { useMemo } from 'react';

const MetaplexProvider = ({ children }) => {
  const { connection } = useConnection();
  const wallet = useWallet();

  const metaplex = useMemo(() => {
    return Metaplex.make(connection)
      .use(walletOrGuestIdentity(wallet.connected ? wallet : null));
  }, [connection, wallet]);

  return (
    <MetaplexContext.Provider value={{ metaplex }}>
      {children}
    </MetaplexContext.Provider>
  )
}

export default MetaplexProvider;