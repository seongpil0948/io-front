import { getIoCollection, getMapper, insertById } from "@/plugins/firebase";
import {
  IoCollection,
  type IoJson,
  type KeyMapper,
  type MapCols,
  type MapKey,
  type MapperCRT,
  type MappingJson,
  type ValueOf,
} from "@/types";
import type {
  DocumentSnapshot,
  DocumentData,
  FirestoreDataConverter,
} from "firebase/firestore";
import { uniqueArr } from "../common";

class Mapper implements MapperCRT {
  // FIXME: 동의어 컬럼 파싱시 모두 lowerCase 적용
  userId: string;
  cols: MapCols;
  colSynonyms: KeyMapper;

  constructor(c: MapperCRT) {
    this.userId = c.userId;
    this.cols = c.cols;
    this.colSynonyms = c.colSynonyms;
  }

  async update() {
    await insertById<Mapper>(
      this,
      getIoCollection({ c: IoCollection.MAPPER }),
      this.userId,
      true,
      mapConverter
    );
  }
  static async getIoMapper(uid: string): Promise<Mapper> {
    let m = await getMapper(uid);
    if (!m) {
      const mapper = new Mapper({
        userId: uid,
        cols: {} as MapCols,
        colSynonyms: {} as KeyMapper,
      });
      await mapper.update();
      m = await getMapper(uid);
      if (!m) {
        throw Error("No such Or Null According to  Mapper document!");
      }
    }
    return m;
  }

  getSyno(key: MapKey): ValueOf<IoJson> {
    if (!this.colSynonyms[key]) {
      this.colSynonyms[key] = [];
    }
    return this.colSynonyms[key];
  }
  setSyno(key: MapKey, val: string[]): void {
    this.colSynonyms[key] = uniqueArr(val.map(mapTxt));
  }

  setColVal(
    colName: MapKey,
    shopProdId: string,
    originVal: string,
    mappingVal: string | string[]
  ) {
    if (!this.cols[colName]) {
      this.cols[colName] = {};
    }
    if (!this.cols[colName][shopProdId]) {
      this.cols[colName][shopProdId] = {};
    }
    if (Array.isArray(mappingVal)) {
      this.cols[colName][shopProdId] = {};
      uniqueArr(mappingVal).forEach((mVal) => {
        mVal = mapTxt(mVal);
        this.cols[colName][shopProdId][mVal] = originVal;
      });
    } else {
      mappingVal = mapTxt(mappingVal);
      this.cols[colName][shopProdId][mappingVal] = originVal;
    }
  }
  getColVal(colName: MapKey, shopProdId: string): MappingJson {
    if (!this.cols[colName]) {
      this.cols[colName] = {};
    }
    if (!this.cols[colName][shopProdId]) {
      this.cols[colName][shopProdId] = {};
    }
    return this.cols[colName][shopProdId];
  }
  getKeyVal(colName: MapKey, shopProdId: string, originVal: string): string[] {
    const col = this.getColVal(colName, shopProdId);
    return Object.keys(col).filter((mVal) => col[mVal] === originVal);
  }

  static fromJson(data: { [x: string]: any }): Mapper | null {
    return data && data.userId
      ? new Mapper({
          userId: data.userId,
          cols: data.cols ?? {},
          colSynonyms: data.colSynonyms ?? {},
        })
      : null;
  }

  toJson() {
    return JSON.parse(JSON.stringify(this));
  }

  getProdMapper() {
    // 상품 nameSyno 과 매칭되는 상품들중 하위 컬러매퍼와 매칭이 된다? 오케이
    return Object.keys(this.cols.prodName).reduce((acc, shopProdId) => {
      Object.entries(this.cols.prodName[shopProdId]).forEach(
        ([nameSyno, ioProdName]) => {
          acc[`${nameSyno} iobox ${shopProdId}`] = {
            ioProdName,
            colorMapper: this.cols.color[shopProdId],
            sizeMapper: this.cols.size[shopProdId],
          };
        }
      );
      return acc;
    }, {} as { [nameSynoId: string]: { ioProdName: string; colorMapper: MappingJson; sizeMapper: MappingJson } });
  }
}

const mapConverter: FirestoreDataConverter<Mapper | null> = {
  toFirestore: (m: Mapper) => m.toJson(),
  fromFirestore: (
    snapshot: DocumentSnapshot<DocumentData>,
    options: any
  ): Mapper | null => {
    const data = snapshot.data(options);
    return data ? Mapper.fromJson(data) : null;
  },
};

const synonymMatch = (subMapper: { [key: string]: any }, inVal: string) =>
  Object.keys(subMapper).find((syno) => inVal.includes(syno));
const synonymFilter = (subMapper: { [key: string]: any }, inVal: string) =>
  Object.keys(subMapper).filter((syno) => inVal.includes(syno));
const mapTxt = (s: string) => s.toLowerCase().trim();

export { Mapper, synonymMatch, synonymFilter, mapTxt, mapConverter };
