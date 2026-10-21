// Builds an Alpine component from several parts ("mixins").
//
//   compose(taskBoard(), { get taskPool() { … } })
//
// Later parts override earlier ones. Unlike `{ ...a, ...b }`, getters stay getters
// (a spread would evaluate them once and freeze the value), so they remain reactive.
export function compose(...parts) {
  const out = {};
  for (const part of parts) Object.defineProperties(out, Object.getOwnPropertyDescriptors(part));
  return out;
}
