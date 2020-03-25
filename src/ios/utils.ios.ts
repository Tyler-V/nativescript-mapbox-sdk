import { MapboxColor } from '../common/color.common';
import { Color } from 'tns-core-modules/color';

export function toReferenceToCArray<T>(input: T[], type: interop.Type<T>): interop.Reference<T> {
  const ref = new interop.Reference<T>(type, interop.alloc(interop.sizeof(CLLocationCoordinate2D) * input.length));
  for (let i = 0; i < input.length; i++) {
    ref[i] = input[i];
  }

  return ref;
}

export function toExpressionStop(array: (number | MapboxColor)[][]): NSDictionary<NSNumber, UIColor> {
  let dict = new NSMutableDictionary<any, any>({ capacity: array.length });
  for (let i = 0; i < array.length; i++) {
    const aKey = array[i][0];
    let anObject = array[i][1];
    if (isMapboxColor(anObject)) {
      anObject = mapboxColorToColor(array[i][1] as MapboxColor);
    }
    dict.setObjectForKey(anObject, aKey);
  }

  return dict;
}

export const isMapboxColor = (input: any) => {
  try {
    return input.__proto__.constructor.name === 'MapboxColor';
  } catch {
    return false;
  }
};

export const mapboxColorToColor = (color: MapboxColor) => {
  return new Color(color.alpha ? color.alpha : 255, color.red, color.green, color.blue).ios;
};
