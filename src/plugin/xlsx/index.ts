import { useMessage } from "naive-ui";
// import { ref } from "vue";
import { utils, read, type WorkSheet, type WorkBook } from "xlsx";
// https://drive.google.com/drive/u/1/folders/13cXvwAZqqdC4a3GyYti20sqtaXzL0HOa
// https://docs.sheetjs.com/docs/csf/general/
// https://github.com/SheetJS/sheetjs/issues/864

type ReadExcelData = string | ArrayBuffer | null | undefined;
export function useExcel() {
  const msg = useMessage();

  function readExcel(data: ReadExcelData) {
    return readExcelIo(data, msg);
  }

  function dataSlice(sheet: WorkSheet, start?: number, end?: number) {
    let denseData = sheet["!data"] as any[];
    if ((start && denseData.length < start) || (end && denseData.length < end))
      return;
    denseData = denseData.slice(start, end);
    sheet["!data"] = denseData;
    return sheet;
  }

  return {
    readExcel,
    dataSlice,
    msg,
  };
}
export function readExcelIo(
  data: ReadExcelData,
  msg: ReturnType<typeof useMessage>
) {
  let workBook: WorkBook;
  try {
    workBook = read(data, {
      type: "binary",
      dense: true,
      password: "1234",
    });
  } catch (err) {
    if (err instanceof Error) {
      if (err.message.includes("File is password-protected")) {
        msg.error("File is password-protected");
      }
    }
    throw err;
  }
  console.info("parsed workBook: ", JSON.parse(JSON.stringify(workBook)));
  return workBook;
}

export function aoaBySheet(workBook: WorkBook, defval = "") {
  const result: { [sName: string]: any[][] } = {};
  for (let i = 0; i < Object.keys(workBook.Sheets).length; i++) {
    const sheetName = Object.keys(workBook.Sheets)[i];
    const sheet = workBook.Sheets[sheetName];
    result[sheetName] = sheetToAoa(sheet, defval);
  }
  return result;
}

export function sheetToAoa(sheet: WorkSheet, defval = "") {
  const jsonArr = utils.sheet_to_json<any[]>(sheet, {
    header: 1,
    defval,
  });
  return jsonArr;
}

// only used for once at parse
// function deleteRow(ws: WorkSheet, row_index: number) {
//   if (!ws["!ref"]) return;
//   console.log("before delete row: ", ws["!ref"]);
//   const rng = utils.decode_range(ws["!ref"]);
//   for (let R = row_index; R < rng.e.r; ++R) {
//     for (let C = rng.s.c; C <= rng.e.c; ++C) {
//       ws[utils.encode_cell({ r: R, c: C })] =
//         ws[utils.encode_cell({ r: R + 1, c: C })];
//     }
//   }
//   rng.e.r--;
//   ws["!ref"] = utils.encode_range(rng.s, rng.e);
//   console.log("after delete row: ", ws["!ref"]);
// }
// delete_row(sheet, 1);

// interface President {
//   terms: { type: "prez" | "viceprez" }[];
//   name: { first: string; last: string };
//   bio: { birthday: string };
// }

// async function xport() {
//   /* fetch JSON data and parse */
//   const url = "https://sheetjs.com/data/executive.json";
//   const raw_data: President[] = await (await fetch(url)).json();

//   /* filter for the Presidents */
//   const prez = raw_data.filter((row) =>
//     row.terms.some((term) => term.type === "prez")
//   );

//   /* flatten objects */
//   const rows = prez.map((row) => ({
//     name: row.name.first + " " + row.name.last,
//     birthday: row.bio.birthday,
//   }));

//   /* generate worksheet and workbook */
//   const worksheet = utils.json_to_sheet(rows);
//   const workbook = utils.book_new();
//   utils.book_append_sheet(workbook, worksheet, "Dates");

//   /* fix headers */
//   utils.sheet_add_aoa(worksheet, [["Name", "Birthday"]], { origin: "A1" });

//   /* calculate column width */
//   const max_width = rows.reduce((w, r) => Math.max(w, r.name.length), 10);
//   worksheet["!cols"] = [{ wch: max_width }];

//   /* create an XLSX file and try to save to Presidents.xlsx */
//   writeFile(workbook, "Presidents.xlsx");
// }
