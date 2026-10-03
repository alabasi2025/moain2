export const haptic = {
  ok: () => { try { navigator.vibrate?.(10); } catch { /* unsupported */ } },
  err: () => { try { navigator.vibrate?.([10, 30, 10]); } catch { /* unsupported */ } },
};
