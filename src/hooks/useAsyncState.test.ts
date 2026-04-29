import { act, renderHook } from '@testing-library/react';
import { useAsyncState } from './useAsyncState';

describe('useAsyncState', () => {
  it('tracks loading and error state', async () => {
    const { result } = renderHook(() => useAsyncState<number>(0));

    await act(async () => {
      await result.current.run(async () => 42);
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();

    await act(async () => {
      await expect(
        result.current.run(async () => {
          throw new Error('fail');
        })
      ).rejects.toThrow('fail');
    });

    expect(result.current.error).toBe('fail');
  });
});
