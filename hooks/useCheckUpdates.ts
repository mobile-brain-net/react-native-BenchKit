import { useEffect, useState } from 'react';
import * as Updates from 'expo-updates';

export const useCheckUpdates = () => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (!__DEV__) {
      const checkForUpdates = async () => {
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            await Updates.fetchUpdateAsync();
            await Updates.reloadAsync();
          } else {
            setIsReady(true);
          }
        } catch (error) {
          console.error('Error fetching updates: ', error);
          setIsReady(true);
        }
      };
      checkForUpdates();
    } else {
      setIsReady(true);
    }
  }, []);

  if (!isReady) {
    return true;
  }
  return null;
};
