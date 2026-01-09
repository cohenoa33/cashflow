const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;


  export function validatePassword(password: string): string | null {
    if (!validPassword(password)) {
      return "Password must be at least 8 characters and include a lowercase letter, an uppercase letter, a number, and a special character";
    }
    return null;
  }
   
  export function validPassword(password: string): boolean {
    return PASSWORD_REGEX.test(password)
  } 