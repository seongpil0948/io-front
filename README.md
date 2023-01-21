# io-front


# Agenda
- 한함수에서 한개 이상의 테이블을 다룰ㄸ, 일관성 유지를 위해 Transaction 을 이용해야한다.
#  Reference
### Vscode Setup
  - [typescript-vue](https://github.com/idahogurl/vs-code-prettier-eslint/tree/master/examples/typescript-vue)
### Boot Pay
- [DEV-DOC](https://docs.bootpay.co.kr/next/)
## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your end-to-end tests
```
npm run test:e2e
```

### Lints and fixes files
```
npm run lint
```

### testing with emulator and cypress
```
npm run dev:test
npm run cypress:open
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## Emulator Update
1. `stuff/latest-data/firestore` 경로가 없다면 생성 해주세요
2. `stuff/latest-data/auth_export` 경로가 없다면 생성 쓰
3. `$sh scripts/emulator:down:dev.sh io-box-develop ` 을 실행쓰 
4. `stuff/latest-data/firestore/{bucket-name}/all_namespaces` 폴더로 `stuff/local-data/firestore_export/all_namespaces` 경로를 대체합니다 (기존 폴더 삭제 또는 백업)
5. `stuff/latest-data/firestore/{bucket-name}/{bucket-name}.overall_export_metadata` 파일로 `stuff/local-data/firestore_export/firestore_export.overall_export_metadata` 파일을 대체 (기존 폴더 삭제 또는 백업)
6. `$node scripts/emulator:auth:import.cjs` 
