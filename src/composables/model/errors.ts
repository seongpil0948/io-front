class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

class PropertyRequiredError extends ValidationError {
  properties: string;
  constructor(properties: string) {
    super("No properties: " + properties);
    this.name = "PropertyRequiredError";
    this.properties = properties;
  }
}

// 사용법
// function readUser(json) {
//   const user = JSON.parse(json);

//   if (!user.age) {
//     throw new PropertyRequiredError("age");
//   }
//   if (!user.name) {
//     throw new PropertyRequiredError("name");
//   }

//   return user;
// }

// try..catch와 readUser를 함께 사용하면 다음과 같습니다.
// try {
//   const user = readUser('{ "age": 25 }');
// } catch (err) {
//   if (err instanceof ValidationError) {
//     alert("Invalid data: " + err.message); // Invalid data: No property: name
//     alert(err.name); // PropertyRequiredError
//     alert(err.property); // name
//   } else if (err instanceof SyntaxError) {
//     alert("JSON Syntax Error: " + err.message);
//   } else {
//     throw err; // 알려지지 않은 에러는 재던지기 합니다.
//   }
// }

export { ValidationError, PropertyRequiredError };
