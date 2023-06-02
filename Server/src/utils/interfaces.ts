
export interface IString {
   [key: string]: string,
}

export interface IBoolean {
   [key: string]: boolean,
}

export interface INumber {
   [key: string]: number,
}

export interface INumberList {
   [key: string]: INumber,
}

export interface ILogin {
   userName:      string,
   password:      string,
}

export interface ISignin extends ILogin {
   verifyUserName: string,
   verifyPassword: string,
}

export interface IEntity {
   userID:     number,
   playerName: string,
}

export interface IAuthSocket {
   playerName:  string,
   playerToken: string,
   userToken:   string,
}

export interface IPosition {
   x: number,
   y: number,
}

export interface ISize {
   width:  number,
   height: number,
}

export interface ISquare extends IPosition, ISize {
   
}

export interface ICircle extends IPosition {
   radius: number;
}

export interface ILine {
   startX: number;
   startY: number;
   endX:   number;
   endY:   number;
}