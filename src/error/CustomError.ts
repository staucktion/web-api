class CustomError {
  private readonly errorType: string;
  private readonly className: string;
  private readonly methodName: string;
  private readonly error: any;
  private readonly message: string;

  private constructor(errorType: string, className: string, methodName: string, error: Error, message: string) {
    this.errorType = errorType;
    this.className = className;
    this.methodName = methodName;
    this.error = error;
    this.message = message;
  }

  public static builder() {
    return new this.Builder();
  }

  private getErrorMessage(): string {
    let errorMessage = `${this.errorType} -> ${this.className}.${this.methodName}: `;

    if (this.error?.response)
      errorMessage += "Response:\n" + JSON.stringify(this.error.response.data, null, 2);
    else if (this.error?.code)
      errorMessage += this.error.code;

    if (this.message) errorMessage += this.message;

    return errorMessage;
  }

  public throwError() {
    const errorMessage = this.getErrorMessage();
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  public logToTerminal() {
    const errorMessage = this.getErrorMessage();
    console.error(errorMessage);
  }

  // nested builder class
  private static Builder = class {
    private errorType: string;
    private className: string;
    private methodName: string;
    private error: Error;
    private message: string;

    public setErrorType(errorType: string): this {
      this.errorType = errorType;
      return this;
    }

    public setClassName(className: string): this {
      this.className = className;
      return this;
    }

    public setMethodName(methodName: string): this {
      this.methodName = methodName;
      return this;
    }

    public setError(error: Error): this {
      this.error = error;
      return this;
    }

    public setMessage(message: string): this {
      this.message = message;
      return this;
    }

    public build(): CustomError {
      return new CustomError(
        this.errorType,
        this.className,
        this.methodName,
        this.error,
        this.message
      );
    }
  };
}

export default CustomError;
