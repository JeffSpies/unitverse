import { Service } from "./service";

export abstract class AbstractCache extends Service {
  public abstract get (key: string): any
  public abstract set (key: string, value: any): void
}