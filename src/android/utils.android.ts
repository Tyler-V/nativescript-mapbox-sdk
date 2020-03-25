import { MapboxColor } from '../common/color.common';

declare const com, java: any;
const stop = com.mapbox.mapboxsdk.style.expressions.Expression.stop;
const rgba = com.mapbox.mapboxsdk.style.expressions.Expression.rgba;
const rgb = com.mapbox.mapboxsdk.style.expressions.Expression.rgb;

export const number = (input: number) => {
  if (Number.isInteger(input)) {
    return new java.lang.Integer(input);
  } else {
    return new java.lang.Double(input);
  }
};

export const isMapboxColor = (input: any) => {
  try {
    return input.__proto__.constructor.name === 'MapboxColor';
  } catch {
    return false;
  }
};

export const mapboxColorToColor = (color: MapboxColor) => {
  if (color.alpha) {
    return rgba(number(color.red), number(color.green), number(color.blue), number(color.alpha));
  } else {
    return rgb(number(color.red), number(color.green), number(color.blue));
  }
};

export const marshall = (input: number | MapboxColor) => {
  if (isMapboxColor(input)) {
    return mapboxColorToColor(input as MapboxColor);
  } else if (typeof input === 'number') {
    return number(input);
  }
  return input;
};

export const toExpressionStop = (stops: (number | MapboxColor)[][]) => {
  const array = [];
  for (let input of stops) {
    const _stop = marshall(input[0]);
    const _value = marshall(input[1]);
    array.push(stop(_stop, _value));
  }
  return array;
};
