export function toReferenceToCArray<T>(input: T[], type: interop.Type<T>): interop.Reference<T> {
  const ref = new interop.Reference<T>(type, interop.alloc(interop.sizeof(CLLocationCoordinate2D) * input.length));
  for (let i = 0; i < input.length; i++) {
    ref[i] = input[i];
  }

  return ref;
}
