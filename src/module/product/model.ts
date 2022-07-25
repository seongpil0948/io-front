import { ProductCrt } from "@/module";

export abstract class Product implements ProductCrt {
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
  titleImgs: string[];
  bodyImgs: string[];
  info: string;
  description: string;
  prodPrice: number;
  prodName: string;
  constructor(d: ProductCrt) {
    this.createdAt = d.createdAt;
    this.updatedAt = d.updatedAt;
    this.titleImgs = d.titleImgs;
    this.bodyImgs = d.bodyImgs;
    this.info = d.info;
    this.description = d.description;
    this.prodPrice = d.prodPrice;
    this.prodName = d.prodName;
  }
}
