export function handleError(error: unknown,msgID:number): string {
    const msgDict: { [id: number]: string } = {
      1: "Login failed",
      2: "Create account failed",
      3: "Load account failed",
      4: "Create transaction failed",
      5: "Load transactions failed",
      6: "Load profile failed"
    };
    const defMsg = msgDict[msgID] || "Operation failed"

       if (error instanceof Error) {
        return(error.message || defMsg);
      } else if (typeof error === "string") {
        return(error);
      } else {
        try {
          return(JSON.stringify(error) || defMsg);
        } catch {
          return(defMsg);
        }
      }
    }