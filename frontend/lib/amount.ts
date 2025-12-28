export function getAmountInputValue(value: string): string | void {
let v= value
  if (!/^[\d.-]*$/.test(v)) return;
  if (v.length > 15) return;

  const dashCount = (v.match(/-/g) || []).length;
  if (dashCount > 1) return;
  if (dashCount === 1 && v.indexOf("-") !== 0) return;

  const dotCount = (v.match(/\./g) || []).length;
  if (dotCount > 1) return;

  if (v === "" || v === "-" || v === ".") {
    return v;
  }
  if (v === "-.") {
    return "-0.";
  }

  // Normalize ".x" to "0.x" and "-.x" to "-0.x"
  if (v.startsWith(".")) v = "0" + v;
  if (v.startsWith("-.")) v = v.replace("-.", "-0.");
  if (v.length > 1 && v[0] === "0" && !v.includes(".")) {
    return v.slice(1);
  }
  if (v.length >= 3 && v.startsWith("-0") && !v.startsWith("-0.")) {
    const split = v.split(".");
    const whole = Number(split[0]);
    if (split.length === 1) {
      return whole.toString();
    } else {
      return [whole.toString(), split[1]].join(".");
    }
  }

  // IMPORTANT: keep trailing dot while typing (e.g. "12.")
  if (v.endsWith(".")) {
    return v;
  }
  const num = Number(v);

  if (!Number.isNaN(num)) {
    return v;
  }
}

 function numberOrNull(value: string): number | null {
   const num = Number(value);
   return !Number.isNaN(num) ? num : null;
 }


function updateValue(startingBalance: string, sign?: "-" | "+"): string {
    const num = numberOrNull(startingBalance);
    if (num === null) return "";
    const str = sign === "+" ? num + 1 : num - 1
    return str.toString();
  }

export function getAmountKeyDownValue(
  key: "ArrowUp" | "ArrowDown" | "Backspace",
  startingBalance: string
): string | void{

   if (key === "ArrowUp") {
     if (
       startingBalance === "" ||
       startingBalance === "-" ||
       startingBalance === "."
     ) {
       return "1";
     } else {
       return updateValue(startingBalance, "+");
     }
   } else if (key === "ArrowDown") {
     if (
       startingBalance === "" ||
       startingBalance === "-" ||
       startingBalance === "."
     ) {
       return "-1";
     } else {
       return updateValue(startingBalance, "-");
     }
   } else if (key === "Backspace") {
     const s = String(startingBalance);
     if (s.length <= 1) {
       return "";
     } else {
       const newS = s.slice(0, -1);

       if (newS === "-" || newS === "." || newS === "0." || newS === "-0") {
         return newS;
       } else {
         const num = Number(newS);
         return Number.isNaN(num) ? "" : String(num);
       }
     }
   }
}
