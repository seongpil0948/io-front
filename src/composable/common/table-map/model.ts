import { CommonField } from "@/composable/common/model";
import { logger as log } from "@/plugin/logger";
import { commonToJson, uniqueArr } from "@io-boxies/js-lib";
import { insertById, getIoCollection, IoCollection } from "@io-boxies/js-lib";
import type {
  DocumentSnapshot,
  DocumentData,
  FirestoreDataConverter,
} from "firebase/firestore";
import { MAPPER_DB } from "./db";
import {
  MapperCRT,
  MapCols,
  KeyMapper,
  MapKey,
  MappingJson,
  ProdMapper,
} from "./domain";
import { ioFireStore } from "@/plugin/firebase";

class Mapper implements MapperCRT {
  userId: string;
  cols: MapCols;
  colSynonyms: KeyMapper;

  constructor(c: MapperCRT) {
    this.userId = c.userId;
    this.cols = c.cols;
    this.colSynonyms = c.colSynonyms;
  }

  static initialMapper(userId: string) {
    return new Mapper({
      userId: userId,
      cols: {
        prodName: {},
        size: {},
        color: {},
        orderId: {},
        prodPrice: {},
      } as MapCols,
      colSynonyms: {
        prodName: ["상품명", "제품명"],
        size: ["옵션 정보", "옵션정보", "상품옵션", "사이즈"],
        color: ["옵션 정보", "옵션정보", "상품옵션", "컬러"],
        orderId: ["상품주문번호", "주문번호", "주문상세번호"],
        prodPrice: ["상품판매가"],
      } as KeyMapper,
    });
  }

  async update(merge = true) {
    await insertById<Mapper>(
      this,
      getIoCollection(ioFireStore, { c: IoCollection.MAPPER }),
      this.userId,
      merge,
      Mapper.fireConverter()
    );
  }
  static async getIoMapper(userId: string): Promise<Mapper> {
    const m = await MAPPER_DB.getMapper(userId);
    if (!m) {
      const mapper = Mapper.initialMapper(userId);
      await mapper.update();
      return mapper;
    }
    return m;
  }
  static async deleteProdId(userId: string, prodId: string[]) {
    const m = await Mapper.getIoMapper(userId);
    log.debug(null, "deleteProdId: ", m.cols);
    (Object.keys(m.cols) as Array<MapKey>).forEach((mapKey) => {
      prodId.forEach((prodId) => {
        log.debug(null, "mapKey: ", mapKey, m.cols[mapKey][prodId]);
        delete m.cols[mapKey][prodId];
      });
    });
    await m.update();
  }
  getSyno(key: MapKey, upsert = true): string[] {
    if (!this.colSynonyms) {
      this.colSynonyms = {} as typeof this.colSynonyms;
    }
    if (!this.colSynonyms[key] && upsert) {
      this.colSynonyms[key] = [];
    }
    return this.colSynonyms[key] ?? [];
  }
  setSyno(key: MapKey, val: string[]): void {
    this.colSynonyms[key] = uniqueArr(val.map(mapTxt));
  }

  setColVal(
    colName: MapKey,
    prodId: string,
    originVal: string,
    mappingVal: string | string[]
  ) {
    if (!this.cols[colName]) {
      this.cols[colName] = {};
    }
    if (!this.cols[colName][prodId]) {
      this.cols[colName][prodId] = {};
    }
    if (Array.isArray(mappingVal)) {
      // this.cols[colName][prodId] = {};
      uniqueArr(mappingVal).forEach((mVal) => {
        mVal = mapTxt(mVal);
        this.cols[colName][prodId][mVal] = originVal;
      });
    } else {
      mappingVal = mapTxt(mappingVal);
      this.cols[colName][prodId][mappingVal] = originVal;
    }
  }
  deleteColVal(colName: MapKey, prodId: string, mappingVal: string) {
    delete this.cols[colName][prodId][mappingVal];
  }
  getColVal(colName: MapKey, prodId: string): MappingJson {
    if (!this.cols[colName]) {
      this.cols[colName] = {};
    }
    if (!this.cols[colName][prodId]) {
      this.cols[colName][prodId] = {};
    }
    return this.cols[colName][prodId];
  }
  getKeyVal(colName: MapKey, prodId: string, originVal: string): string[] {
    const col = this.getColVal(colName, prodId);
    return Object.keys(col).filter((mVal) => col[mVal] === originVal);
  }

  static fromJson(data: { [x: string]: any }): Mapper | null {
    if (!data || !data.userId) return null;
    const initMapper = Mapper.initialMapper(data.userId);
    return new Mapper({
      userId: data.userId,
      cols: data.cols ?? initMapper.cols,
      colSynonyms: data.colSynonyms ?? initMapper.colSynonyms,
    });
  }

  toJson() {
    return commonToJson(this);
  }

  getProdMapper(): ProdMapper {
    // 상품 nameSyno 과 매칭되는 상품들중 하위 컬러매퍼와 매칭이 된다? 오케이
    return Object.keys(this.cols.prodName).reduce((acc, prodId) => {
      Object.entries(this.cols.prodName[prodId]).forEach(
        ([nameSyno, ioProdName]) => {
          acc[`${nameSyno} iobox ${prodId}`] = {
            ioProdName,
            colorMapper: this.cols.color[prodId],
            sizeMapper: this.cols.size[prodId],
          };
        }
      );
      return acc;
    }, {} as { [nameSynoId: string]: { ioProdName: string; colorMapper: MappingJson; sizeMapper: MappingJson } });
  }
  static fireConverter(): FirestoreDataConverter<Mapper | null> {
    return {
      toFirestore: (u: Mapper) =>
        u instanceof CommonField ? u.toJson() : Mapper.fromJson(u)!.toJson(),
      fromFirestore: (
        snapshot: DocumentSnapshot<DocumentData>,
        options: any
      ): Mapper | null => {
        const data = snapshot.data(options);
        return data ? Mapper.fromJson(data) : null;
      },
    };
  }
}

const synonymMatch = (subMapper: { [key: string]: any }, inVal: string) =>
  Object.keys(subMapper).find((syno) => inVal.includes(syno));

const synonymFilter = (
  subMapper: { [key: string]: any },
  inVal: string
): string | undefined =>
  Object.keys(subMapper)
    .filter((syno) => inVal.includes(syno))
    .sort((a, b) => b.length - a.length)[0];

const mapTxt = (s: string) => s.toLowerCase().trim();

export { Mapper, synonymMatch, synonymFilter, mapTxt };
