import { useEffect, useState } from 'react';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useSearchParams } from 'next/navigation';

export const useGetCallById = (id: string | string[]) => {
  const [call, setCall] = useState<Call>();
  const [isCallLoading, setIsCallLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const client = useStreamVideoClient();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!client) {
      console.log('[useGetCallById] Client not ready yet');
      return; // Keep isCallLoading=true while waiting for client
    }
    
    setIsCallLoading(true);

    if (!id) {
      setError('Invalid meeting ID');
      setIsCallLoading(false);
      return;
    }

    const loadCall = async () => {
      try {
        const create = searchParams.get('create');
        if (create === 'true') {
          console.log('[useGetCallById] Creating new call:', id);
          const newCall = client.call('default', id as string);
          await newCall.getOrCreate();
          setCall(newCall);
          setError(null);
        } else {
          console.log('[useGetCallById] Querying call:', id);
          const { calls } = await client.queryCalls({ filter_conditions: { id } });
          
          if (calls.length > 0) {
            console.log('[useGetCallById] Call found:', calls[0].id);
            setCall(calls[0]);
            setError(null);
          } else {
            console.warn('[useGetCallById] Call not found:', id);
            setError('Meeting not found');
            setCall(undefined);
          }
        }
      } catch (error: any) {
        console.error("[useGetCallById] Failed to query call:", error);
        setError(error?.message || 'Failed to load meeting');
        setCall(undefined);
      } finally {
        setIsCallLoading(false);
      }
    };

    loadCall();
  }, [client, id]);

  return { call, isCallLoading, error };
};
