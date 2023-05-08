
export interface IString {
   [key: string]: string,
}

export interface INumber {
   [key: string]: number,
}

export interface ILogin {
   userName:      string,
   password:      string,
}

export interface ISignin extends ILogin {
   verifUserName: string,
   verifPassword: string,
}