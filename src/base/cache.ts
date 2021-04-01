export abstract class AbstractCache {
  public abstract get (key: string): any
  public abstract set (key: string, value: any): void
}