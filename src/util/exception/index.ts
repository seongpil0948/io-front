// https://ko.javascript.info/custom-errors
export class IoBoxError extends Error {
  constructor(message: string) {
    super(message);
    // IoBoxDefaultError
    this.name = this.constructor.name;
  }
}

export class IoNotSupportedEnv extends IoBoxError {}
export class EnvNotMatchedWithInstance extends IoBoxError {}
export class NotInitializedIoFireApp extends IoBoxError {
  constructor() {
    super("must use IoFireApp after initialized, and add env param for init");
  }
}

export class RequiredField extends IoBoxError {
  constructor(funcName: string, field: string) {
    super(`function ${funcName} required field: ${field}`);
  }
}

export class MapColNotFound extends IoBoxError {
  colName!: string;
  inputValue!: string;
  inputProdName?: string;
  synonyms?: string[];
  message!: string;
  constructor(d: {
    colName: string;
    inputValue: string;
    inputProdName?: string;
    synonyms?: string[];
  }) {
    let message = `${d.colName} 컬럼 매핑 실패, 입력값: ${d.inputValue}`;
    if (d.inputProdName) {
      message += `, 상품명: ${d.inputProdName}`;
    }
    if (d.synonyms) {
      message += `, 사용가능한 매핑목록: ${d.synonyms.join(", ")}`;
    }
    super(message);
    Object.assign(this, { ...d, message });
    // this.colName = d.colName;
    // this.inputValue = d.inputValue;
    // this.inputProdName = d.inputProdName;
    // this.synonyms = d.synonyms;

    Object.setPrototypeOf(this, MapColNotFound.prototype);
  }
}
// export type TMapCellNotFound = MapColNotFound & Partial<MapCellNotFoundCrt>;
