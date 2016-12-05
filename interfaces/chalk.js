declare module "chalk" {
  declare function blue (format:string):string;
  declare function green(format:string):string;
  declare function red  (format:string):string;

  declare class Style {
    open:  string;
    close: string;
  }

  declare class Styles {
    red:  Style;
    blue: Style;
  }

  declare var styles:Styles;
}

