let label_acc = 1;
export const timeTrack = async <R>(label: string, handler: () => Promise<R>) => {
  const fullLabel = `${label_acc++}. ${label}`;
  try {
    console.time(fullLabel);
    return await handler();
  } finally {
    console.timeEnd(fullLabel);
  }
};