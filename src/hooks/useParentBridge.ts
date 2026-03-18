import { useEffect, useCallback, useRef, useState } from 'react';
import type { AvatarPayload, ShoeGenMessage, ParentMessage, ShoeConfig } from '../types';

/**
 * Handles postMessage communication between the Shoe Workshop (iframe)
 * and the Q-bit Shop (parent window).
 */
export function useParentBridge() {
  const [avatarData, setAvatarData] = useState<AvatarPayload | null>(null);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [closeRequested, setCloseRequested] = useState(false);
  const parentOriginRef = useRef<string>('*');

  const clearCloseRequest = useCallback(() => setCloseRequested(false), []);

  useEffect(() => {
    const embedded = window.self !== window.top;
    setIsEmbedded(embedded);

    if (!embedded) return;

    const handleMessage = (event: MessageEvent) => {
      const data = event.data as ParentMessage | undefined;
      if (!data?.type?.startsWith('qbit:')) return;

      parentOriginRef.current = event.origin;

      if (data.type === 'qbit:avatar-data') {
        setAvatarData(data.payload);
      }
      if (data.type === 'qbit:coin-balance') {
        setAvatarData((prev) => {
          if (!prev) return prev;
          return { ...prev, coinBalance: data.payload.coinBalance };
        });
      }
      if (data.type === 'qbit:request-close') {
        setCloseRequested(true);
      }
    };

    window.addEventListener('message', handleMessage);

    window.parent.postMessage({ type: 'shoegen:ready' } satisfies ShoeGenMessage, '*');

    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const send = useCallback((msg: ShoeGenMessage) => {
    if (window.self === window.top) return;
    window.parent.postMessage(msg, parentOriginRef.current);
  }, []);

  const sendEquipped = useCallback(
    (shoeConfig: ShoeConfig, shoeResult?: unknown) =>
      send({ type: 'shoegen:equipped', payload: { shoeConfig, shoeResult } }),
    [send],
  );

  const sendPhaseChange = useCallback(
    (phase: string) => send({ type: 'shoegen:phase-change', payload: { phase } }),
    [send],
  );

  const sendRetry = useCallback(() => send({ type: 'shoegen:retry' }), [send]);
  const sendClose = useCallback(() => send({ type: 'shoegen:close' }), [send]);
  const sendSpendCoins = useCallback(
    (amount: number, reason = 'shoe-generation') =>
      send({ type: 'shoegen:spend-coins', payload: { amount, reason } }),
    [send],
  );

  return {
    isEmbedded,
    avatarData,
    closeRequested,
    clearCloseRequest,
    sendEquipped,
    sendPhaseChange,
    sendRetry,
    sendClose,
    sendSpendCoins,
  };
}
