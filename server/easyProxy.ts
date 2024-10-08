export const easyProxy = <T extends object>(value: T, props: Partial<T>) => {
  return new Proxy(value, {
    get(t, p, r) {
      if (Object.hasOwn(props, p)) {
        return Reflect.get(props, p, r);
      }
      return Reflect.get(t, p, r);
    },
  });
};
