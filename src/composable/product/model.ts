import { ProductCrt, PROD_TYPE, VISIBILITY } from "@/composable";
import { OutputData } from "@editorjs/editorjs/types/data-formats";

export abstract class Product implements ProductCrt {
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  info: string | OutputData;
  description: string;
  TBD: { [k: string]: any };
  prodType: PROD_TYPE;
  visible: VISIBILITY;
  constructor(d: ProductCrt) {
    this.createdAt = d.createdAt;
    this.updatedAt = d.updatedAt;
    this.info = d.info;
    this.description = d.description;
    this.TBD = d.TBD;
    this.prodType = d.prodType;
    this.visible = d.visible;
  }
}
