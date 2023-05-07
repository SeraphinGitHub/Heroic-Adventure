
// Can to contain:
// LETTER || letter || accent letter
export const nameReg: RegExp = new RegExp(/^[A-Za-zÜ-ü]+$/);

// Can contain:
// LETTER || letter || number || accent letter || symbol
export const pswReg: RegExp = new RegExp(/^[A-Za-zÜ-ü0-9#$€£%^&*]+$/);