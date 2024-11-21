export const ButtonType = {
  button: 'button',
  submit: 'submit',
  reset: 'reset',
} as const;
export type ButtonType = (typeof ButtonType)[keyof typeof ButtonType];

export const ButtonAppearance = {
  FAB: 'FAB',
  subtle: 'subtle',
  main: 'main'
} as const;
export type ButtonAppearance =
  (typeof ButtonAppearance)[keyof typeof ButtonAppearance];
