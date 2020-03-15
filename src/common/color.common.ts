import { isIOS, isAndroid } from 'tns-core-modules/platform';
import { Color } from 'tns-core-modules/color';

declare const com, java: any;
const rgba = com.mapbox.mapboxsdk.style.expressions.Expression.rgba;
const rgb = com.mapbox.mapboxsdk.style.expressions.Expression.rgb;

export const number = (input: number) => {
  if (Number.isInteger(input)) {
    return new java.lang.Integer(input);
  } else {
    return new java.lang.Double(input);
  }
};

export class MapboxColor {
  protected red: number;
  protected green: number;
  protected blue: number;
  protected alpha: number;

  constructor(red: number, green: number, blue: number, alpha?: number) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }

  getColor() {
    if (isAndroid) {
      if (this.alpha) {
        return rgba(number(this.red), number(this.green), number(this.blue), number(this.alpha));
      } else {
        return rgb(number(this.red), number(this.green), number(this.blue));
      }
    } else if (isIOS) {
      const color = new Color(this.alpha ? this.alpha : 255, this.red, this.green, this.blue);
      return color.ios;
    }
  }
}
