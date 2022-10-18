import { ProductCrt } from "@/composable";
import { OutputData } from "@editorjs/editorjs/types/data-formats";

export abstract class Product implements ProductCrt {
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  info: string | OutputData;
  description: string;
  constructor(d: ProductCrt) {
    this.createdAt = d.createdAt;
    this.updatedAt = d.updatedAt;
    this.info = d.info;
    this.description = d.description;
  }
}
