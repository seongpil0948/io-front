import { CommonField } from "@/composable/common/model";
import { logger as log } from "@/plugin/logger";
import { insertById, getIoCollection, IoCollection, uniqueArr } from "@/util";
import type {
  DocumentSnapshot,
  DocumentData,
  FirestoreDataConverter,
} from "firebase/firestore";
import { MAPPER_DB } from "./db";
import { MapperCRT, MapCols, KeyMapper, MapKey, MappingJson } from "./domain";

class Mapper implements MapperCRT {
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
      Mapper.fireConverter()
    );
  }
  static async getIoMapper(uid: string): Promise<Mapper> {
    const m = await MAPPER_DB.getMapper(uid);
    if (!m) {
      const mapper = new Mapper({
        userId: uid,
        cols: {} as MapCols,
        colSynonyms: {} as KeyMapper,
      });
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
    if (!this.colSynonyms[key] && upsert) {
      this.colSynonyms[key] = [];
    }
    return this.colSynonyms[key];
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
      this.cols[colName][prodId] = {};
      uniqueArr(mappingVal).forEach((mVal) => {
        mVal = mapTxt(mVal);
        this.cols[colName][prodId][mVal] = originVal;
      });
    } else {
      mappingVal = mapTxt(mappingVal);
      this.cols[colName][prodId][mappingVal] = originVal;
    }
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
const synonymFilter = (subMapper: { [key: string]: any }, inVal: string) =>
  Object.keys(subMapper).filter((syno) => inVal.includes(syno));
const mapTxt = (s: string) => s.toLowerCase().trim();

export { Mapper, synonymMatch, synonymFilter, mapTxt };
