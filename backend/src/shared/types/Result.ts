/**
 * Result Type - Functional Error Handling
 *
 * Instead of throwing exceptions, we return Result objects that contain
 * either a success value or an error message.
 *
 * This pattern is common in functional programming and makes error handling explicit.
 *
 * @example
 * function divide(a: number, b: number): Result<number> {
 *   if (b === 0) {
 *     return Result.fail('Cannot divide by zero');
 *   }
 *   return Result.ok(a / b);
 * }
 *
 * const result = divide(10, 2);
 * if (result.isSuccess) {
 *   console.log(result.value); // 5
 * } else {
 *   console.log(result.error); // Error message
 * }
 */

export class Result<T> {
  public readonly isSuccess: boolean;
  public readonly isFailure: boolean;
  public readonly error: string | undefined;
  private readonly _value: T | undefined;

  private constructor(isSuccess: boolean, error?: string, value?: T) {
    if (isSuccess && error) {
      throw new Error('InvalidOperation: A result cannot be successful and contain an error');
    }
    if (!isSuccess && !error) {
      throw new Error('InvalidOperation: A failing result needs to contain an error message');
    }

    this.isSuccess = isSuccess;
    this.isFailure = !isSuccess;
    this.error = error;
    this._value = value;

    Object.freeze(this);
  }

  /**
   * Gets the value (only available if isSuccess is true)
   * Throws error if trying to access value on failed result
   */
  public get value(): T {
    if (!this.isSuccess) {
      throw new Error(`Cannot retrieve the value from a failed result. Error: ${this.error}`);
    }

    return this._value as T;
  }

  /**
   * Gets the value or returns a default value if failed
   */
  public getValueOrDefault(defaultValue: T): T {
    return this.isSuccess ? (this._value as T) : defaultValue;
  }

  /**
   * Gets the value or returns undefined if failed
   */
  public getValueOrUndefined(): T | undefined {
    return this.isSuccess ? this._value : undefined;
  }

  /**
   * Creates a successful result
   */
  public static ok<U>(value?: U): Result<U> {
    return new Result<U>(true, undefined, value);
  }

  /**
   * Creates a failed result
   */
  public static fail<U>(error: string): Result<U> {
    return new Result<U>(false, error);
  }

  /**
   * Combines multiple results into one
   * If any result fails, returns the first failure
   */
  public static combine(results: Result<unknown>[]): Result<unknown> {
    for (const result of results) {
      if (result.isFailure) {
        return result;
      }
    }
    return Result.ok();
  }

  /**
   * Maps the value if successful
   */
  public map<U>(fn: (value: T) => U): Result<U> {
    if (this.isFailure) {
      return Result.fail<U>(this.error as string);
    }
    return Result.ok<U>(fn(this.value));
  }

  /**
   * FlatMap - useful for chaining operations that return Results
   */
  public flatMap<U>(fn: (value: T) => Result<U>): Result<U> {
    if (this.isFailure) {
      return Result.fail<U>(this.error as string);
    }
    return fn(this.value);
  }
}
