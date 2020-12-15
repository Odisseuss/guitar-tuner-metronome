export interface ColorScheme {
  primary: string;
  gradient_lighter: string;
  gradient_darker: string;
}
let A: ColorScheme = {
  primary: "#F72640",
  gradient_lighter: "#1F0E18",
  gradient_darker: "#0F0910",
};
let B: ColorScheme = {
  primary: "#F79726",
  gradient_lighter: "#1F170E",
  gradient_darker: "#100C09",
};
let C: ColorScheme = {
  primary: "#F7C926",
  gradient_lighter: "#1F1C0E",
  gradient_darker: "#100F09",
};
let D: ColorScheme = {
  primary: "#26F761",
  gradient_lighter: "#0E1F13",
  gradient_darker: "#09100C",
};
let E: ColorScheme = {
  primary: "#269FF7",
  gradient_lighter: "#0E191F",
  gradient_darker: "#090D10",
};
let F: ColorScheme = {
  primary: "#5026F7",
  gradient_lighter: "#100E1F",
  gradient_darker: "#0B0910",
};
let G: ColorScheme = {
  primary: "#9B26F7",
  gradient_lighter: "#180E1F",
  gradient_darker: "#0D0910",
};
export interface ColorSchemes {
  A: ColorScheme;
  B: ColorScheme;
  C: ColorScheme;
  D: ColorScheme;
  E: ColorScheme;
  F: ColorScheme;
  G: ColorScheme;
}
let colors: ColorSchemes = { A: A, B: B, C: C, D: D, E: E, F: F, G: G };
export default colors;
